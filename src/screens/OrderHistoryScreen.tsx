import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getDriverTrips, TripData} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

export default function OrderHistoryScreen({navigation}: any) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>(
    'all',
  );
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrips = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (pageNum === 1 && !isRefresh) setLoading(true);

        const response = await getDriverTrips(pageNum, 10);

        if (isRefresh || pageNum === 1) {
          setTrips(response.trips || []);
        } else {
          setTrips(prev => [...prev, ...(response.trips || [])]);
        }

        setHasMore(response.hasNext);
        setPage(response.page);
      } catch (error) {
        console.log('Error fetching trips:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTrips(1);
  }, [fetchTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips(1, true);
  }, [fetchTrips]);

  // Handle filtering
  // Our backend filter logic will depend on what 'status' string comes back.
  // Assuming 'completed' and 'cancelled' map reasonably to the frontend names.
  const filteredTrips =
    filter === 'all'
      ? trips
      : trips.filter(t => t.status?.toLowerCase() === filter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#3B82F6"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('completed')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'cancelled' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('cancelled')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              filter === 'cancelled' && styles.filterTextActive,
            ]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : filteredTrips.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No trips found</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          }>
          {filteredTrips.map(order => (
            <TouchableOpacity
              key={order.id || Math.random().toString()}
              style={styles.orderCard}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: order.id})
              }
              activeOpacity={0.7}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id || 'N/A'}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    order.status?.toLowerCase() === 'cancelled' &&
                      styles.statusBadgeCancelled,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      order.status?.toLowerCase() === 'cancelled' &&
                        styles.statusTextCancelled,
                    ]}>
                    {order.status || 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.orderRoute}>
                <Text style={styles.routeText} numberOfLines={1}>
                  📍 {order.pickup_location || 'Unknown Pickup'}
                </Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.routeText} numberOfLines={1}>
                  🎯 {order.dropoff_location || 'Unknown Dropoff'}
                </Text>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : 'N/A'}
                </Text>
                <Text style={styles.orderAmount}>₹{order.amount || 0}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    marginRight: scale(12),
  },
  headerTitle: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    gap: scale(8),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: verticalScale(100),
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: verticalScale(120),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
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
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#50C878',
  },
  statusTextCancelled: {
    color: '#EF4444',
  },
  orderRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  routeText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#666',
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
    borderTopColor: '#F5F5F5',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#9CA3AF',
    marginTop: verticalScale(12),
    fontWeight: '500',
  },
});
