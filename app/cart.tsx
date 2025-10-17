import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function CartScreen() {
  const router = useRouter();
  const ICON_SIZE = 24;
  const ICON_COLOR = '#321901';
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [consumerName, setConsumerName] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Replace with actual user id from auth
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = (await supabase.auth.getSession());
      setUserId(sessionData?.session?.user?.id ?? null);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: sessionData } = (await supabase.auth.getSession());
      // Get cart for user
      const userId = sessionData?.session?.user?.id;
      console.log('handleAddToCart userId:', userId);
      const { data: cartData } = await supabase.from('cart').select('id').eq('user_id', userId).single();
      console.log('Fetched cart data:', cartData);
      if (!cartData) return setLoading(false);
      // Get cart items and join with product info
      const { data: items, error } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, product:products(id, name, description, price, image_url)')
        .eq('cart_id', cartData.id);
      console.log('Fetched cart items:', items);
      console.log('Error fetching items:', error);
      console.log('Fetched items:', items);
      setCartItems(items || []);
      setOrderTotal(((items as any[]) || []).reduce((sum: number, item: any) => sum + ((item.product?.price || 0) * item.quantity), 0));
      setLoading(false);
    };
    fetchCart();
  }, [userId]);

  const handleQuantity = async (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', id);
    setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
    setOrderTotal((prev) => prev + delta * (item.product?.price || 0));
  };

  const handleRemove = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    setOrderTotal(cartItems.filter((i) => i.id !== id).reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0));
  };

  const handlePlaceOrder = async () => {
    if (!userId || cartItems.length === 0) return;
    try {
      // Try to get profile for shipping defaults
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city, state, postal_code, country')
        .eq('id', userId)
        .single();

      const shipping = {
        name: consumerName || profile?.full_name || 'Customer',
        phone: profile?.phone || 'NA',
        address: profile?.address || 'NA',
        city: profile?.city || 'NA',
        state: profile?.state || 'NA',
        postal_code: profile?.postal_code || '000000',
        country: profile?.country || 'India',
      };

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          shipping_amount: 0,
          discount_amount: 0,
          final_amount: totalAmount,
          shipping_name: shipping.name,
          shipping_phone: shipping.phone,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_state: shipping.state,
          shipping_postal_code: shipping.postal_code,
          shipping_country: shipping.country,
          notes: 'Placed from mobile app',
        })
        .select('id')
        .single();

      if (orderError || !order) {
        console.error('Order create error: ', orderError);
        alert('Failed to place order. Please try again.');
        return;
      }

      const orderItems = cartItems.map((ci) => ({
        order_id: order.id,
        product_id: ci.product_id,
        product_name: ci.product?.name,
        product_price: ci.product?.price,
        quantity: ci.quantity,
        total_price: (ci.product?.price || 0) * ci.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error('Order items error: ', itemsError);
        alert('Failed to save order items.');
        return;
      }

      // Clear cart
      const itemIds = cartItems.map((i) => i.id);
      await supabase.from('cart_items').delete().in('id', itemIds);
      setCartItems([]);
      setOrderTotal(0);
      alert('Order placed!');
      router.replace('/products');
    } catch (e) {
      console.error('Order error: ', e);
      alert('Something went wrong.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5efe4' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5efe4' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f5efe4' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={ICON_SIZE} color={ICON_COLOR} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="cart-outline" size={ICON_SIZE} color={ICON_COLOR} style={{ marginRight: 16 }} />
          <Ionicons name="log-out-outline" size={ICON_SIZE} color={ICON_COLOR} onPress={() => router.replace('/login')} />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        {cartItems.length === 0 ? (
          <Text style={styles.empty}>Your cart is empty.</Text>
        ) : (
          <>
          <TextInput
          placeholder="Soap Consumer Name (optional)"
          value={consumerName}
          onChangeText={setConsumerName}
          style={{ backgroundColor: '#fff8e1', borderRadius: 8, padding: 12, marginTop: 8, fontSize: 16, color: '#321901' }}
        />
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                {/* Col 1: Image */}
                <Image source={{ uri: item.product?.image_url }} style={styles.rowImage} resizeMode="cover" />

                {/* Col 2: Name + Qty controls */}
                <View style={styles.rowMiddle}>
                  <Text style={styles.rowName} numberOfLines={2}>{item.product?.name}</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={[styles.qtyButton, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} onPress={() => handleQuantity(item.id, -1)}>
                      <Ionicons name="remove" size={ICON_SIZE} color={ICON_COLOR} />
                    </TouchableOpacity>
                    <View style={styles.qtyValueWrap}>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                    </View>
                    <TouchableOpacity style={[styles.qtyButton, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]} onPress={() => handleQuantity(item.id, 1)}>
                      <Ionicons name="add" size={ICON_SIZE} color={ICON_COLOR} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Col 3: Remove icon */}
                <TouchableOpacity style={styles.rowRight} onPress={() => handleRemove(item.id)}>
                  <Ionicons name="trash-outline" size={ICON_SIZE} color={ICON_COLOR} />
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
          </>
        )}
        <View style={{ marginVertical: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#321901', marginBottom: 8 }}>Order Summary</Text>
          <Text style={{ fontSize: 16, color: '#618000' }}>Total Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
          <Text style={{ fontSize: 16, color: '#2a3e00', marginBottom: 8 }}>Total Price: ${orderTotal}</Text>
         
        </View>
        {cartItems.length > 0 && (
          <Button title="Place Order" color="#321901" onPress={handlePlaceOrder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff8e1',
    borderRadius: 24,
    margin: 16,
    shadowColor: '#321901',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#618000',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  empty: {
    textAlign: 'center',
    color: '#321901',
    fontSize: 18,
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf7d4',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#321901',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f5efe4',
  },
  rowMiddle: {
    flex: 1,
    paddingHorizontal: 12,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#321901',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyButton: {
    backgroundColor: '#d7ecae',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c5df95',
  },
  qtyValueWrap: {
    paddingHorizontal: 12,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#321901',
  },
  rowRight: {
    padding: 8,
  },
});
