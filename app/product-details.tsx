import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { removeItem } from '../lib/mmkv';

export default function ProductDetailsScreen() {
  const { text, short_description, description, price, image_url } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#321901" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/orders')} style={{ marginRight: 16 }}>
            <Ionicons name="receipt-outline" size={28} color="#2a3e00" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={{ marginRight: 16 }}>
            <Ionicons name="cart-outline" size={28} color="#2a3e00" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await router.replace('/login');
              removeItem('user_type');
            }}
          >
            <Ionicons name="log-out-outline" size={28} color="#2a1400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={{ uri: image_url as string }} style={styles.image} resizeMode="cover" />

        <Text style={styles.name}>{text}</Text>
        <Text style={styles.shortDescription}>{short_description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Product Details</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.price}>Price: ₹{price}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2a3e00' }]}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    // backgroundColor: '#f5efe4',
  },
  scrollContainer: {
    padding: 20,
    // backgroundColor: '#fff8e1',
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f5efe4',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#321901',
    textAlign: 'center',
  },
  shortDescription: {
    fontSize: 16,
    color: '#618000',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#d3c6a3',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2a3e00',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#4e4e4e',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 20,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a3e00',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
