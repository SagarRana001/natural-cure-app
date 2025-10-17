import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { removeItem } from '../lib/mmkv';

export default function ProductDetailsScreen() {
  const { name, details, price, image_url } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5efe4' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f5efe4' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#321901" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/cart' })} style={{ marginRight: 16 }}>
            <Ionicons name="receipt-outline" size={28} color="#2a3e00" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/cart' })} style={{ marginRight: 16 }}>
            <Ionicons name="cart-outline" size={28} color="#2a3e00" />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await router.replace('/login'); removeItem('user_type'); }}>
            <Ionicons name="log-out-outline" size={28} color="#2a1400" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <Image source={{ uri: image_url as string }} style={styles.image} resizeMode="cover" />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>{details}</Text>
        <Text style={styles.price}>Price: ${price}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ borderRadius: 8, overflow: 'hidden' }}>
              <Button title="Add to Cart" color="#2a3e00" onPress={() => {/* TODO: Implement add to cart */}} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ borderRadius: 8, overflow: 'hidden' }}>
              <Button title="Place Order" color="#321901" onPress={() => {/* TODO: Implement place order */}} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#321901',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f5efe4',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#321901',
    marginBottom: 12,
    textAlign: 'center',
  },
  details: {
    fontSize: 18,
    color: '#618000',
    marginBottom: 16,
    textAlign: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a3e00',
    marginBottom: 8,
    textAlign: 'center',
  },
});
