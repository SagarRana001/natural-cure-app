import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Button,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syncCartItems } from '../lib/cartService';
import { removeItem } from '../lib/mmkv';
import { supabase } from '../lib/supabase';

const COLORS = {
  primary: '#000',
  accent: '#618000',
  background: '#fff',
  card: '#fafafa',
  shadow: 'rgba(0,0,0,0.05)',
  textPrimary: '#222',
  textSecondary: '#555',
  border: '#ededed',
};

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
  const [cart, setCart] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifAnim = useState(new Animated.Value(-80))[0];
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const router = useRouter();

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error(error);
    else setProducts(data || []);
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
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        Alert.alert('Authentication error', sessionError.message || 'Unable to get user session.');
        return;
      }
      const userId = sessionData?.session?.user?.id;
      if (!userId || !selectedProduct) {
        Alert.alert('Not signed in', 'Please log in to add items to your cart.');
        router.push('/login');
        return;
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      setCart((prev) => [...prev, { product_id: selectedProduct.id, quantity: qty, product: selectedProduct }]);

      const synced = await syncCartItems(userId, [{ product_id: selectedProduct.id, quantity: qty }]);
      if (synced && synced[0]) {
        setCart((prev) =>
          prev.map((c) =>
            c.product_id === synced[0].product_id && c.quantity === synced[0].quantity && !c.id
              ? { ...c, id: synced[0].id }
              : c
          )
        );
      }

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
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while adding to cart.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    try {
      removeItem('user_type');
    } catch (e) {}
    router.replace('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Notification */}
      {showNotif && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: COLORS.accent,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateY: notifAnim }],
          }}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Added to cart!</Text>
        </Animated.View>
      )}

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <View
            style={{
              backgroundColor: COLORS.background,
              borderRadius: 16,
              padding: 24,
              width: '80%',
              alignItems: 'center',
              shadowColor: COLORS.shadow,
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3,
            }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 }}>
              Set Quantity
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 8,
                padding: 12,
                fontSize: 18,
                color: COLORS.textPrimary,
                width: '60%',
                textAlign: 'center',
                marginBottom: 16,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Button title="Cancel" color="#555" onPress={() => setShowModal(false)} />
              <Button title="Add" color={COLORS.accent} onPress={handleAddToCart} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 12 }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/orders', params: { cart: JSON.stringify(cart) } })}
          style={{ marginRight: 16 }}>
          <Ionicons name="receipt-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/cart', params: { cart: JSON.stringify(cart) } })}
          style={{ marginRight: 16 }}>
          <Ionicons name="cart-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <View style={{ flex: 1, padding: 16 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: COLORS.accent,
          }}>
          Our Products
        </Text>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 12,
                marginBottom: 20,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={() => router.push({ pathname: '/product-details', params: { ...item } })}>
              <Image
                source={{ uri: item.image_url }}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 8,
                  marginBottom: 12,
                  backgroundColor: COLORS.background,
                }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 }}>
                {item.details}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.accent }}>
                  ₹{item.price}
                </Text>
                <TouchableOpacity
                  onPress={() => handleAddToCartPopup(item)}
                  style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 24,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
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
