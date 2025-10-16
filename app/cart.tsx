import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [consumerName, setConsumerName] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Replace with actual user id from auth
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = (await supabase.auth.getSession());
      setUserId(sessionData?.session?.user?.id);
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
        .select('id, product_id, quantity, products(id, name, description, price, image_url)')
        .eq('cart_id', cartData.id);
      console.log('Fetched cart items:', items);
      console.log('Error fetching items:', error);
      console.log('Fetched items:', items);
      setCartItems(items || []);
      setOrderTotal((items || []).reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0));
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
    // TODO: Save order to Supabase, include consumerName
    alert('Order placed!');
    router.replace('/products');
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
          <Ionicons name="arrow-back" size={28} color="#321901" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="cart-outline" size={28} color="#2a3e00" style={{ marginRight: 16 }} />
          <Ionicons name="log-out-outline" size={28} color="#2a1400" onPress={() => router.replace('/login')} />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        {cartItems.length === 0 ? (
          <Text style={styles.empty}>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.product?.image_url }} style={styles.image} resizeMode="cover" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{item.product?.name}</Text>
                  <Text style={styles.details}>{item.product?.details}</Text>
                  <Text style={styles.price}>${item.product?.price}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                    <Button title="-" color="#2a1400" onPress={() => handleQuantity(item.id, -1)} />
                    <Text style={{ marginHorizontal: 12, fontWeight: 'bold', fontSize: 16 }}>{item.quantity}</Text>
                    <Button title="+" color="#618000" onPress={() => handleQuantity(item.id, 1)} />
                  </View>
                  <Button title="Remove" color="#2a1400" onPress={() => handleRemove(item.id)} />
                </View>
              </View>
            )}
          />
        )}
        <View style={{ marginVertical: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#321901', marginBottom: 8 }}>Order Summary</Text>
          <Text style={{ fontSize: 16, color: '#618000' }}>Total Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
          <Text style={{ fontSize: 16, color: '#2a3e00', marginBottom: 8 }}>Total Price: ${orderTotal}</Text>
          <TextInput
            placeholder="Soap Consumer Name (optional)"
            value={consumerName}
            onChangeText={setConsumerName}
            style={{ backgroundColor: '#fff8e1', borderRadius: 8, padding: 12, marginTop: 8, fontSize: 16, color: '#321901' }}
          />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf7d4',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#321901',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5efe4',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#321901',
    marginBottom: 4,
  },
  details: {
    fontSize: 15,
    color: '#618000',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a3e00',
    marginBottom: 8,
  },
});
