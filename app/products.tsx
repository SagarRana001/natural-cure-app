import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Button, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  details: string;
  price: number;
  image_url: string;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifAnim = useState(new Animated.Value(-80))[0];
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const router = useRouter();

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCartPopup = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('1');
    setShowModal(true);
  };

  const handleAddToCart = async () => {
    setShowModal(false);
    // Get user id
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (userError || !userId || !selectedProduct) {
      // Show error notification
      setShowNotif(true);
      Animated.timing(notifAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(notifAnim, {
            toValue: -80,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setShowNotif(false));
        }, 1200);
      });
      return;
    }
    // Get or create cart for user
    let { data: cartData, error: cartError } = await supabase.from('cart').select('id').eq('user_id', userId).single();
    if (cartError) {
      // Show error notification
      setShowNotif(true);
      Animated.timing(notifAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(notifAnim, {
            toValue: -80,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setShowNotif(false));
        }, 1200);
      });
      return;
    }
    if (!cartData) {
      const { data: newCart, error: newCartError } = await supabase.from('cart').insert({ user_id: userId }).select('id').single();
      if (newCartError || !newCart) {
        // Show error notification
        setShowNotif(true);
        Animated.timing(notifAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(notifAnim, {
              toValue: -80,
              duration: 400,
              useNativeDriver: true,
            }).start(() => setShowNotif(false));
          }, 1200);
        });
        return;
      }
      cartData = newCart;
    }
    // Add item to cart_item
    const { error: cartItemError } = await supabase.from('cart_item').insert({ cart_id: cartData.id, product_id: selectedProduct.id, quantity: parseInt(quantity, 10) });
    if (cartItemError) {
      // Show error notification
      setShowNotif(true);
      Animated.timing(notifAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(notifAnim, {
            toValue: -80,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setShowNotif(false));
        }, 1200);
      });
      return;
    }
    // Success notification
    setShowNotif(true);
    Animated.timing(notifAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(notifAnim, {
          toValue: -80,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowNotif(false));
      }, 1200);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fce6b5' }}>
      {showNotif && (
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: '#618000',
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          transform: [{ translateY: notifAnim }],
        }}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Added to cart!</Text>
        </Animated.View>
      )}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff8e1', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#321901', marginBottom: 12 }}>Set Quantity</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={{ backgroundColor: '#fce6b5', borderRadius: 8, padding: 12, fontSize: 18, color: '#321901', width: '60%', textAlign: 'center', marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Button title="Cancel" color="#2a1400" onPress={() => setShowModal(false)} />
              <Button title="Add" color="#618000" onPress={handleAddToCart} />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 12, backgroundColor: '#fce6b5' }}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/cart', params: { cart: JSON.stringify(cart) } })} style={{ marginRight: 16 }}>
          <Ionicons name="cart-outline" size={28} color="#2a3e00" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#2a1400" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, padding: 16, backgroundColor: '#fce6b5' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#618000' }}>Our Products</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff8e1', borderRadius: 12, marginBottom: 20, padding: 16, shadowColor: '#321901', shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 }}>
              <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#fce6b5' }} resizeMode="cover" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#321901', marginBottom: 6 }}>{item.name}</Text>
              <Text style={{ fontSize: 16, color: '#618000', marginBottom: 8 }}>{item.details}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2a3e00' }}>Price: ${item.price}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ borderRadius: 8, overflow: 'hidden' }}>
                    <Button
                      title="View Details"
                      color="#618000"
                      onPress={() => router.push({ pathname: '/product-details', params: { ...item } })}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ borderRadius: 8, overflow: 'hidden' }}>
                    <Button title="Add to Cart" color="#2a3e00" onPress={() => handleAddToCartPopup(item)} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ borderRadius: 8, overflow: 'hidden' }}>
                    <Button title="Place Order" color="#321901" onPress={() => {/* TODO: Implement place order */}} />
                  </View>
                </View>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProducts();
          }}
        />
      </View>
    </SafeAreaView>
  );
}