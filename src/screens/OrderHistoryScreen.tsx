import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getDriverTrips, getDriverActiveBooking, TripData, ActiveBooking} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

const LIVE_STATUSES = ['accepted', 'driver_assigned', 'ongoing'];

export default function OrderHistoryScreen({navigation}: any) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'live'>('all');
  const [trips, setTrips] = useState<TripData[]>([]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Pulsing animation for the live dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const fetchData = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (pageNum === 1 && !isRefresh) setLoading(true);

        // Fetch trips and active booking in parallel
        const [tripsResponse, active] = await Promise.all([
          getDriverTrips(pageNum, 10),
          getDriverActiveBooking(),
        ]);

        if (isRefresh || pageNum === 1) {
          setTrips(tripsResponse.trips || []);
        } else {
          setTrips(prev => [...prev, ...(tripsResponse.trips || [])]);
        }

        setHasMore(tripsResponse.hasNext);
        setPage(tripsResponse.page);
        setActiveBooking(active);
      } catch {/* non-critical */} finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(1, true);
  }, [fetchData]);

  const filteredTrips =
    filter === 'all'
      ? trips
      : filter === 'live'
      ? []
      : trips.filter(t => t.status?.toLowerCase() === filter);

  const hasLiveOrder =
    activeBooking != null &&
    LIVE_STATUSES.includes(activeBooking.status?.toLowerCase() ?? '');

  const renderLiveCard = () => {
    if (!activeBooking) return null;
    const statusLabel = (activeBooking.status ?? '').replace(/_/g, ' ');
    const fare = activeBooking.estimated_fare ?? 0;
    const dist = activeBooking.distance != null ? parseFloat(String(activeBooking.distance)) : null;

    return (
      <TouchableOpacity
        style={styles.liveCard}
        onPress={() => navigation.navigate('Navigation', {bookingId: activeBooking.id})}
        activeOpacity={0.85}>
        {/* Pulse indicator */}
        <View style={styles.livePulseWrapper}>
          <Animated.View
            style={[
              styles.livePulseRing,
              {transform: [{scale: pulseAnim}]},
            ]}
          />
          <View style={styles.liveDot} />
        </View>

        <View style={styles.liveCardContent}>
          <View style={styles.liveCardTop}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.liveStatusText}>
              {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
            </Text>
            <Text style={styles.liveFare}>₹{Number(fare).toFixed(0)}</Text>
          </View>

          <View style={styles.orderRoute}>
            <View style={styles.routeRow}>
              <View style={styles.routeDotBlue} />
              <Text style={styles.routeText} numberOfLines={1}>
                {activeBooking.pickup_address || 'Pickup location'}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={styles.routeDotGreen} />
              <Text style={styles.routeText} numberOfLines={1}>
                {activeBooking.drop_address || 'Drop location'}
              </Text>
            </View>
          </View>

          <View style={styles.liveCardFooter}>
            {dist != null && (
              <View style={styles.chip}>
                <Ionicons name="navigate-outline" size={moderateScale(12)} color="#475569" />
                <Text style={styles.chipText}>{dist.toFixed(1)} km</Text>
              </View>
            )}
            {activeBooking.vehicle_type && (
              <View style={styles.chip}>
                <Ionicons name="car-outline" size={moderateScale(12)} color="#475569" />
                <Text style={styles.chipText}>{activeBooking.vehicle_type}</Text>
              </View>
            )}
            <View style={styles.resumeButton}>
              <Text style={styles.resumeButtonText}>Resume Order</Text>
              <Ionicons name="arrow-forward" size={moderateScale(14)} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        {hasLiveOrder && (
          <View style={styles.headerLiveBadge}>
            <View style={styles.headerLiveDot} />
            <Text style={styles.headerLiveText}>Live</Text>
          </View>
        )}
      </View>

      <View style={styles.filterContainer}>
        {hasLiveOrder && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              styles.filterButtonLive,
              filter === 'live' && styles.filterButtonLiveActive,
            ]}
            onPress={() => setFilter('live')}
            activeOpacity={0.7}>
            <View style={styles.liveFilterDotWrapper}>
              <View style={styles.liveFilterDot} />
            </View>
            <Text
              style={[
                styles.filterText,
                filter === 'live' && styles.filterTextLiveActive,
                filter !== 'live' && {color: '#10B981'},
              ]}>
              Live
            </Text>
          </TouchableOpacity>
        )}
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

          {/* Live order card — shown at top when filter is 'all' or 'live' */}
          {(filter === 'all' || filter === 'live') && hasLiveOrder && renderLiveCard()}

          {/* Live filter: only show the live card above, no history list */}
          {filter === 'live' && (
            <View style={styles.liveOnlyHint}>
              <Ionicons name="information-circle-outline" size={moderateScale(16)} color="#94A3B8" />
              <Text style={styles.liveOnlyHintText}>
                Switch to "All" to see your completed and cancelled trips.
              </Text>
            </View>
          )}

          {/* History list */}
          {filter !== 'live' && filteredTrips.length === 0 && !hasLiveOrder && (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No trips found</Text>
            </View>
          )}

          {filter !== 'live' && filteredTrips.length === 0 && hasLiveOrder && filter !== 'all' && (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No {filter} trips found</Text>
            </View>
          )}

          {filter !== 'live' &&
            filteredTrips.map(order => {
              const isCancelled = order.status?.toLowerCase() === 'cancelled';
              const isCompleted = order.status?.toLowerCase() === 'completed';
              const statusColor = isCompleted
                ? '#10B981'
                : isCancelled
                ? '#EF4444'
                : '#F59E0B';
              const fare = parseFloat(String(order.amount || '0'));
              const earnings = order.driver_earnings
                ? parseFloat(String(order.driver_earnings))
                : null;

              return (
                <View
                  key={order.id || Math.random().toString()}
                  style={[
                    styles.orderCard,
                    isCancelled && styles.orderCardCancelled,
                  ]}>
                  <View style={styles.orderHeader}>
                    <View style={{flex: 1}}>
                      <Text style={styles.orderId}>#{order.id?.slice(0, 8)}</Text>
                      {order.customer_name && (
                        <Text style={styles.customerName}>{order.customer_name}</Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: statusColor + '15'},
                      ]}>
                      <Text style={[styles.statusText, {color: statusColor}]}>
                        {order.status?.charAt(0).toUpperCase() +
                          (order.status?.slice(1) || '')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderRoute}>
                    <View style={styles.routeRow}>
                      <View style={styles.routeDotBlue} />
                      <Text style={styles.routeText} numberOfLines={1}>
                        {order.pickup_location || 'Pickup location'}
                      </Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeRow}>
                      <View style={styles.routeDotGreen} />
                      <Text style={styles.routeText} numberOfLines={1}>
                        {order.dropoff_location || 'Drop location'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chipRow}>
                    {order.vehicle_type && (
                      <View style={styles.chip}>
                        <Ionicons
                          name="car-outline"
                          size={moderateScale(12)}
                          color="#475569"
                        />
                        <Text style={styles.chipText}>{order.vehicle_type}</Text>
                      </View>
                    )}
                    {order.distance && (
                      <View style={styles.chip}>
                        <Ionicons
                          name="navigate-outline"
                          size={moderateScale(12)}
                          color="#475569"
                        />
                        <Text style={styles.chipText}>
                          {parseFloat(order.distance).toFixed(1)} km
                        </Text>
                      </View>
                    )}
                    {order.payment_status && (
                      <View
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              order.payment_status === 'paid'
                                ? '#DCFCE7'
                                : '#FEF2F2',
                          },
                        ]}>
                        <Ionicons
                          name={
                            order.payment_status === 'paid'
                              ? 'checkmark-circle'
                              : 'time'
                          }
                          size={moderateScale(12)}
                          color={
                            order.payment_status === 'paid'
                              ? '#16A34A'
                              : '#EF4444'
                          }
                        />
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                order.payment_status === 'paid'
                                  ? '#16A34A'
                                  : '#EF4444',
                            },
                          ]}>
                          {order.payment_status === 'paid'
                            ? `${
                                (order.payment_method || 'paid')
                                  .charAt(0)
                                  .toUpperCase() +
                                (order.payment_method || 'paid').slice(1)
                              }`
                            : 'Unpaid'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {isCancelled && order.cancellation_reason && (
                    <View style={styles.cancelReasonBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={moderateScale(14)}
                        color="#94A3B8"
                      />
                      <Text style={styles.cancelReasonText}>
                        {order.cancellation_reason}
                      </Text>
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderDate}>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )
                        : 'N/A'}
                    </Text>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={styles.orderAmount}>₹{fare.toFixed(0)}</Text>
                      {isCompleted && earnings != null && (
                        <Text style={styles.earningsText}>
                          Earned: ₹{earnings.toFixed(0)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
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
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    flex: 1,
  },
  headerLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  headerLiveDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: '#10B981',
  },
  headerLiveText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#10B981',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    gap: scale(6),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterButton: {
    flex: 1,
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(20),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(38),
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonLive: {
    flexDirection: 'row',
    gap: scale(4),
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  filterButtonLiveActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  liveFilterDotWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveFilterDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextLiveActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },

  // ─── Live Card ───────────────────────────────────────────────────
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  livePulseWrapper: {
    width: scale(6),
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseRing: {
    position: 'absolute',
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#FFFFFF',
  },
  liveCardContent: {
    flex: 1,
    padding: scale(14),
  },
  liveCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    gap: scale(8),
  },
  liveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  liveStatusText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  liveFare: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#10B981',
  },
  liveCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(10),
    flexWrap: 'wrap',
  },
  resumeButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#10B981',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  liveOnlyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#F8FAFC',
    padding: scale(12),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(4),
  },
  liveOnlyHintText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },

  // ─── History Cards ────────────────────────────────────────────────
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
  },
  orderCardCancelled: {
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  orderId: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
  },
  customerName: {
    fontSize: moderateScale(12),
    color: '#64748B',
    marginTop: verticalScale(2),
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    flexShrink: 0,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#50C878',
  },
  statusTextCancelled: {
    color: '#EF4444',
  },
  orderRoute: {
    marginBottom: verticalScale(10),
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  routeDotBlue: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#3B82F6',
    flexShrink: 0,
  },
  routeDotGreen: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#10B981',
    flexShrink: 0,
  },
  routeLine: {
    width: 2,
    height: verticalScale(14),
    backgroundColor: '#E2E8F0',
    marginLeft: moderateScale(4),
    marginVertical: verticalScale(2),
  },
  routeText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    marginBottom: verticalScale(10),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  chipText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  cancelReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#FEF2F2',
    padding: scale(8),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
  },
  cancelReasonText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderDate: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    flex: 1,
  },
  orderAmount: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
  },
  earningsText: {
    fontSize: moderateScale(11),
    color: '#10B981',
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(60),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#9CA3AF',
    marginTop: verticalScale(12),
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
});
