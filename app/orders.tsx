import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getItem } from '../lib/mmkv';
import {
  OrderStatus,
  UserRole,
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
  shipping_name?: string;
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
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, OrderItem[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>();

  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const ORDERS_PER_PAGE = 10;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (role && userId && orders.length === 0 && !loadingMore && !refreshing) {
      handleRefresh();
    }
  }, [role, userId]);
  // Fetch user session and role
  useEffect(() => {

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', uid)
          .single();

        if (profileError) {
          const persisted = getItem('user_type');
          if (persisted === 'operator' || persisted === 'seller') {
            setRole(persisted as UserRole);
          }
        } else {
          const userType = profile.user_type as UserRole;
          if (userType === 'operator' || userType === 'seller') {
            setRole(userType);
          }
        }
      }
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setAllLoaded(false);
    setPage(0);
    await fetchOrders(true);  // reset = true to reload from start
    setRefreshing(false);
  };

  // Fetch orders when userId or tab changes
  useEffect(() => {
    if (!userId || !role) return;
    fetchOrders(true);
  }, [userId, activeTab, role]);

  const fetchOrders = async (reset = false) => {
    if (loadingMore || allLoaded) return; // ❌ remove userId check here
    setLoadingMore(true);

    const from = reset ? 0 : page * ORDERS_PER_PAGE;
    const to = from + ORDERS_PER_PAGE - 1;

    // Base query
    // let query = supabase
    //   .from('orders')
    //   .select('*')

    // Role-based filtering
    // if (role === 'seller') {
    //   query = query.eq('user_id', userId); // seller gets own orders only
    // }
    // operator gets all orders (no filter)

    // const { data: ords, error } = await query;
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (role !== 'operator') {
      query = query.eq('user_id', userId);
    }
    const { data: ords, error } = await query;


    if (error) {
      console.error('Fetch orders error:', error);
      setLoadingMore(false);
      return;
    }

    if (!ords || ords.length === 0) {
      setAllLoaded(true);
      setLoadingMore(false);
      return;
    }

    if (reset) {
      setOrders(ords);
      setPage(1);
      setAllLoaded(ords.length < ORDERS_PER_PAGE);
    } else {
      setOrders((prev) => [...prev, ...ords]);
      setPage((prev) => prev + 1);
      if (ords.length < ORDERS_PER_PAGE) setAllLoaded(true);
    }

    // Fetch order items
    const ids = ords.map((o) => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, product_name, product_price, quantity, total_price')
      .in('order_id', ids);

    const map: Record<string, OrderItem[]> = {};
    (items || []).forEach((it) => {
      map[it.order_id] = map[it.order_id] || [];
      map[it.order_id].push(it);
    });

    setOrderItemsByOrderId((prev) => ({ ...prev, ...map }));
    setLoadingMore(false);
  };



  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'pending') {
      return orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    } else if (activeTab === 'completed') {
      return orders.filter((o) => o.status === 'completed');
    } else if (activeTab === 'cancelled') {
      return orders.filter((o) => o.status === 'cancelled');
    }
    return orders;
  }, [orders, activeTab]);


  // Handle order status update
  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['pending', 'confirm', 'inProcess', 'ready', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'completed') {
      Alert.alert('Not Allowed', 'Completed orders cannot be updated.');
      return;
    }
    const newStatus = statusOrder[currentIndex + 1];
    if (!newStatus) return;

    const { data, error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      Alert.alert('Error', 'Failed to update order status');
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      Alert.alert('Success', `Order status updated to ${getStatusDisplayName(newStatus)}`);
    }
  };

  // Show confirmation popup for status update
  const showStatusUpdateOptions = (order: Order) => {
    if (order.status === 'completed') {
      Alert.alert('Not Allowed', 'Completed orders cannot be updated.');
      return;
    }

    Alert.alert(
      'Update Order Status',
      `Move order from ${getStatusDisplayName(order.status)} to next stage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Update', onPress: () => handleStatusUpdate(order.id, order.status) },
      ]
    );
  };

  // Increment / Decrement order item quantity
  const incrementItem = async (orderId: string, item: OrderItem, delta: number) => {
    if (role !== 'operator') return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    const { error } = await supabase
      .from('order_items')
      .update({ quantity: newQty, total_price: newQty * item.product_price })
      .eq('id', item.id);

    if (!error) {
      setOrderItemsByOrderId((prev) => ({
        ...prev,
        [orderId]: (prev[orderId] || []).map((it) =>
          it.id === item.id ? { ...it, quantity: newQty, total_price: newQty * it.product_price } : it
        ),
      }));
    }
  };

  // Cancel order with confirmation popup
  const cancelOrder = (order: Order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      Alert.alert('Not Allowed', 'This order cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);

              if (error) {
                Alert.alert('Error', 'Failed to cancel the order.');
              } else {
                setOrders((prev) =>
                  prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o))
                );
                Alert.alert('Success', 'Your order has been cancelled.');
              }
            } catch (err) {
              console.error('Cancel order exception:', err);
              Alert.alert('Error', 'Something went wrong while cancelling the order.');
            }
          }
        }
      ]
    );
  };

  const ICON_COLOR = '#321901';
  const ICON_SIZE = 20;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={ICON_COLOR} />
        </Pressable>
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
        <Pressable onPress={() => setActiveTab('cancelled')} style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>Cancelled</Text>
        </Pressable>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 64 }}>
          <Text style={{ color: '#888', fontSize: 18 }}>No orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item: order }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>#{order.order_number || (order.id ? order.id.slice(0, 6) : '')}</Text>
                <Text style={styles.cardSub}>{order.shipping_name ?? ''}</Text>
                <Text style={styles.cardAmount}>₹{order.final_amount ?? ''}</Text>
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
              <Text style={styles.cardSub}>Date: {order.created_at ? new Date(order.created_at).toLocaleString() : ''}</Text>

              {(orderItemsByOrderId[order.id] || []).map((it) => (
                <View key={it.id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{it.product_name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {role === 'operator' ? (
                      <>
                        <Pressable
                          style={[styles.qtyBtn, activeTab === 'pending' && order.status === "pending" ? { backgroundColor: '#d7ecae' } : null]}

                          onPress={() => (activeTab === 'pending' && order.status === "pending" ? incrementItem(order.id, it, -1) : undefined)}
                        >
                          <Ionicons name="remove" size={ICON_SIZE} color={ICON_COLOR} />
                        </Pressable>
                        <Text style={styles.qtyVal}>{it.quantity}</Text>
                        <Pressable
                          style={[styles.qtyBtn, activeTab === 'pending' && order.status === "pending" ? { backgroundColor: '#d7ecae' } : null]}
                          onPress={() => (activeTab === "pending" && order.status === "pending" ? incrementItem(order.id, it, 1) : undefined)}
                        >
                          <Ionicons name="add" size={ICON_SIZE} color={ICON_COLOR} />
                        </Pressable>
                      </>
                    ) : (
                      <Text style={styles.qtyVal}>x{it.quantity}</Text>
                    )}
                  </View>
                </View>
              ))}

              {/* Buttons: Update Status & Cancel */}
              {(role === 'operator' || role === 'seller') && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: order.status == "pending" || order.status == "confirm" ? 'space-between' : 'flex-start',
                    marginTop: 12
                  }}
                >
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

                  {(order.status === 'pending' || order.status === 'confirm') && (
                    <Pressable
                      onPress={() => cancelOrder(order)}
                      style={[styles.primaryBtn, { backgroundColor: '#9E9E9E' }]}
                    >
                      <Text style={styles.primaryBtnText}>Cancel</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
          onEndReached={() => fetchOrders()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#000',
  },
  tabText: {
    color: '#321901',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
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
    // backgroundColor: '#d7ecae',
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
