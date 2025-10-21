import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [consumerName, setConsumerName] = useState('');
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUserId(sessionData?.session?.user?.id ?? null);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      const { data: cartData } = await supabase.from('cart').select('id').eq('user_id', userId).single();
      if (!cartData) return setLoading(false);
      const { data: items } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, product:products(id, name, price, image_url)')
        .eq('cart_id', cartData.id);
      setCartItems(items || []);
      setOrderTotal(items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0);
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
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
    );
    setOrderTotal((prev) => prev + delta * (item.product?.price || 0));
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


  const handleRemove = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  const subtotal = orderTotal.toFixed(2);
  const shipping = 0;
  const tax = 0;
  const total = (parseFloat(subtotal) + shipping + tax).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 24 }} />
      </View>
      <TextInput
          placeholder="Soap Consumer Name (optional)"
          value={consumerName}
          onChangeText={setConsumerName}
          style={{ backgroundColor: '#fff8e1', borderRadius: 8, padding: 12, marginTop: 8, fontSize: 16, color: '#321901' }}
        />
      {/* Cart List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Image source={{ uri: item.product?.image_url }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.product?.name}</Text>
              <Text style={styles.itemPrice}>${item.product?.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => handleQuantity(item.id, -1)}>
                  <Ionicons name="remove-circle-outline" size={22} color="#555" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleQuantity(item.id, 1)}>
                  <Ionicons name="add-circle-outline" size={22} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Ionicons name="close-outline" size={22} color="#888" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Sub total</Text>
              <Text style={styles.summaryValue}>${subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Shipping</Text>
              <Text style={styles.summaryValue}>${shipping}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Tax (15%)</Text>
              <Text style={styles.summaryValue}>${tax}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalValue}>${total}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
              <Text style={styles.checkoutText}>CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  loading: { textAlign: 'center', marginTop: 40, fontSize: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#222' },
  itemPrice: { fontSize: 14, color: '#444', marginTop: 4 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyText: { fontSize: 15, fontWeight: '600', color: '#333', marginHorizontal: 10 },
  summaryContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryText: { color: '#777', fontSize: 15 },
  summaryValue: { color: '#000', fontSize: 15, fontWeight: '500' },
  totalText: { fontSize: 17, fontWeight: '700', color: '#000' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#000' },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 20,
  },
  checkoutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
