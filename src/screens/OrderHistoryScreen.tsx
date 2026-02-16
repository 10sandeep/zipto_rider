import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

const orders = [
  { id: 'ORD12345', date: 'Today, 2:30 PM', amount: '₹250', status: 'Completed', pickup: 'ABC Store', delivery: 'MG Road' },
  { id: 'ORD12344', date: 'Today, 12:15 PM', amount: '₹180', status: 'Completed', pickup: 'XYZ Mall', delivery: 'Indiranagar' },
  { id: 'ORD12343', date: 'Yesterday, 6:45 PM', amount: '₹320', status: 'Completed', pickup: 'Food Court', delivery: 'Koramangala' },
  { id: 'ORD12342', date: 'Yesterday, 3:20 PM', amount: '₹150', status: 'Cancelled', pickup: 'Store ABC', delivery: 'JP Nagar' },
];

export default function OrderHistoryScreen({ navigation }: any) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status.toLowerCase() === filter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'cancelled' && styles.filterButtonActive]}
          onPress={() => setFilter('cancelled')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
            activeOpacity={0.7}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={[styles.statusBadge, order.status === 'Cancelled' && styles.statusBadgeCancelled]}>
                <Text style={[styles.statusText, order.status === 'Cancelled' && styles.statusTextCancelled]}>
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderRoute}>
              <Text style={styles.routeText} numberOfLines={1}>📍 {order.pickup}</Text>
              <Text style={styles.routeArrow}>→</Text>
              <Text style={styles.routeText} numberOfLines={1}>🎯 {order.delivery}</Text>
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>{order.date}</Text>
              <Text style={styles.orderAmount}>{order.amount}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: { 
    paddingHorizontal: scale(20), 
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40), 
    paddingBottom: verticalScale(16), 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: { 
    width: moderateScale(44), 
    height: moderateScale(44), 
    borderRadius: moderateScale(22), 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: scale(12) 
  },
  headerTitle: { 
    fontSize: moderateScale(isSmallDevice ? 20 : 24), 
    fontWeight: '800', 
    color: '#1C1C1E' 
  },
  filterContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: scale(20), 
    paddingVertical: verticalScale(16), 
    gap: scale(8), 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  filterButton: { 
    flex: 1, 
    paddingVertical: verticalScale(10), 
    borderRadius: moderateScale(20), 
    backgroundColor: '#F5F5F5', 
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(40),
  },
  filterButtonActive: { 
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: '#666' 
  },
  filterTextActive: { 
    color: '#FFFFFF' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  orderCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(12), 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2,
    minHeight: verticalScale(120),
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: verticalScale(12) 
  },
  orderId: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#1C1C1E',
    flex: 1,
    marginRight: scale(8),
  },
  statusBadge: { 
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: scale(12), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(12),
    flexShrink: 0,
  },
  statusBadgeCancelled: { 
    backgroundColor: '#FEF2F2' 
  },
  statusText: { 
    fontSize: moderateScale(12), 
    fontWeight: '600', 
    color: '#50C878' 
  },
  statusTextCancelled: { 
    color: '#EF4444' 
  },
  orderRoute: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(12) 
  },
  routeText: { 
    flex: 1, 
    fontSize: moderateScale(13), 
    color: '#666' 
  },
  routeArrow: { 
    fontSize: moderateScale(16), 
    color: '#666', 
    marginHorizontal: scale(8),
    flexShrink: 0,
  },
  orderFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: verticalScale(12), 
    borderTopWidth: 1, 
    borderTopColor: '#F5F5F5' 
  },
  orderDate: { 
    fontSize: moderateScale(13), 
    color: '#8E8E93',
    flex: 1,
  },
  orderAmount: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#3B82F6',
    flexShrink: 0,
  },
});