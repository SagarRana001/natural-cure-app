import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getItem } from '../lib/mmkv';
import {
  OrderStatus,
  UserRole,
  canUserUpdateStatus,
  getAvailableStatusUpdates,
  getStatusColor,
  getStatusDisplayName
} from '../lib/rolePermissions';
import { supabase } from '../lib/supabase';

type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  final_amount: number;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
};

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, OrderItem[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('seller');

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    // Check if user has permission to update status
    if (!canUserUpdateStatus(role, currentStatus, newStatus)) {
      Alert.alert(
        'Permission Denied', 
        `You don't have permission to update status from ${getStatusDisplayName(currentStatus)} to ${getStatusDisplayName(newStatus)}`
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        Alert.alert('Error', 'Failed to update order status');
        console.error('Status update error:', error);
      } else {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        Alert.alert('Success', `Order status updated to ${getStatusDisplayName(newStatus)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
      console.error('Status update error:', error);
    }
  };

  const showStatusUpdateOptions = (order: Order) => {
    const availableStatuses = getAvailableStatusUpdates(role, order.status);
    
    if (availableStatuses.length === 0) {
      Alert.alert('No Updates Available', 'No status updates are available for this order');
      return;
    }

    const options = availableStatuses.map(status => ({
      text: getStatusDisplayName(status),
      onPress: () => handleStatusUpdate(order.id, order.status, status)
    }));

    options.push({ text: 'Cancel', onPress: async () => {} });

    Alert.alert(
      'Update Order Status',
      `Current status: ${getStatusDisplayName(order.status)}`,
      options
    );
  };

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id ?? null;
      setUserId(uid);
      
      if (uid) {
        // Fetch user_type from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', uid)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Fallback to persisted user_type
          const persisted = getItem('user_type');
          if (persisted === 'operator' || persisted === 'seller') {
            setRole(persisted as UserRole);
          }
        } else {
          console.log('Profile user_type:', profile.user_type);
          const userType = profile.user_type as UserRole;
          if (userType === 'operator' || userType === 'seller') {
            setRole(userType);
          }
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      const { data: ords } = await supabase
        .from('orders')
        .select('id, user_id, order_number, status, final_amount, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setOrders((ords as any) || []);

      if (ords && ords.length > 0) {
        const ids = ords.map((o: any) => o.id);
        const { data: items } = await supabase
          .from('order_items')
          .select('id, order_id, product_id, product_name, product_price, quantity, total_price')
          .in('order_id', ids);
        const map: Record<string, OrderItem[]> = {};
        (items || []).forEach((it: any) => {
          map[it.order_id] = map[it.order_id] || [];
          map[it.order_id].push(it);
        });
        setOrderItemsByOrderId(map);
      }
    };
    fetchOrders();
  }, [userId]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => (activeTab === 'pending' ? o.status !== 'completed' : o.status === 'completed'));
  }, [orders, activeTab]);

  const incrementItem = async (orderId: string, item: OrderItem, delta: number) => {
    if (role !== 'operator') return; // only operator can edit
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    await supabase.from('order_items').update({ quantity: newQty, total_price: newQty * item.product_price }).eq('id', item.id);
    setOrderItemsByOrderId((prev) => ({
      ...prev,
      [orderId]: (prev[orderId] || []).map((it) => (it.id === item.id ? { ...it, quantity: newQty, total_price: newQty * it.product_price } : it)),
    }));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (role !== 'operator') return;
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const ICON_COLOR = '#321901';
  const ICON_SIZE = 20;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5efe4' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={ICON_COLOR} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#321901' }}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable onPress={() => setActiveTab('pending')} style={[styles.tab, activeTab === 'pending' && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('completed')} style={[styles.tab, activeTab === 'completed' && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: order }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardTitle}>#{order.order_number || order.id.slice(0, 6)}</Text>
              <Text style={styles.cardAmount}>₹{order.final_amount}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.cardSub}>Status: </Text>
              <View style={{ 
                backgroundColor: getStatusColor(order.status), 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                borderRadius: 12 
              }}>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                  {getStatusDisplayName(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.cardSub}>Date: {new Date(order.created_at).toLocaleString()}</Text>

            {(orderItemsByOrderId[order.id] || []).map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>{it.product_name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {role === 'operator' && (
                    <>
                      <Pressable style={styles.qtyBtn} onPress={() => incrementItem(order.id, it, -1)}>
                        <Ionicons name="remove" size={ICON_SIZE} color={ICON_COLOR} />
                      </Pressable>
                      <Text style={styles.qtyVal}>{it.quantity}</Text>
                      <Pressable style={styles.qtyBtn} onPress={() => incrementItem(order.id, it, 1)}>
                        <Ionicons name="add" size={ICON_SIZE} color={ICON_COLOR} />
                      </Pressable>
                    </>
                  )}
                  {role !== 'operator' && <Text style={styles.qtyVal}>x{it.quantity}</Text>}
                </View>
              </View>
            ))}

            {(role === 'operator' || role === 'seller') && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <Pressable 
                  onPress={() => showStatusUpdateOptions(order)} 
                  style={[
                    styles.primaryBtn,
                    { 
                      backgroundColor: getAvailableStatusUpdates(role, order.status).length > 0 
                        ? '#4CAF50' 
                        : '#9E9E9E' 
                    }
                  ]}
                  disabled={getAvailableStatusUpdates(role, order.status).length === 0}
                >
                  <Text style={styles.primaryBtnText}>
                    {getAvailableStatusUpdates(role, order.status).length > 0 
                      ? 'Update Status' 
                      : 'No Updates Available'
                    }
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff8e1',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#eaf7d4',
  },
  tabText: {
    color: '#321901',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2a3e00',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
    shadowColor: '#321901',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#321901',
  },
  cardSub: {
    color: '#6b7280',
    marginTop: 2,
  },
  cardAmount: {
    fontWeight: '700',
    color: '#2a3e00',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemName: {
    flex: 1,
    marginRight: 12,
    color: '#321901',
  },
  qtyBtn: {
    backgroundColor: '#d7ecae',
    padding: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  qtyVal: {
    fontWeight: '700',
    color: '#321901',
    marginHorizontal: 6,
  },
  primaryBtn: {
    backgroundColor: '#2a3e00',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});


