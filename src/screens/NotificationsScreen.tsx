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
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuthStore} from '../store/authStore';
import {
  getAvailableBookings,
  getMyVehicles,
  acceptBooking,
  getNotifications,
  markNotificationsRead,
  AvailableBooking,
  DriverNotificationData,
} from '../services/driverService';
import {
  onBookingAvailable,
  offBookingAvailable,
  onBookingTaken,
  offBookingTaken,
  onNewNotification,
  offNewNotification,
  BookingOffer,
} from '../services/socketService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

interface BookingItem {
  bookingId: string;
  pickup: string;
  drop: string;
  fare: number;
  distance: number;
  vehicleType?: string;
  arrivedAt: number;
}

function offerToItem(offer: BookingOffer): BookingItem {
  return {
    bookingId: offer.bookingId,
    pickup: offer.pickup,
    drop: offer.drop,
    fare: offer.fare,
    distance: offer.distance,
    vehicleType: offer.vehicleType,
    arrivedAt: Date.now(),
  };
}

function apiToItem(b: AvailableBooking): BookingItem {
  return {
    bookingId: b.id,
    pickup: b.pickup_address,
    drop: b.drop_address,
    fare: b.estimated_fare,
    distance: b.distance,
    vehicleType: b.vehicle_type,
    arrivedAt: new Date(b.created_at).getTime(),
  };
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) {return `${diff}s ago`;}
  if (diff < 3600) {return `${Math.floor(diff / 60)}m ago`;}
  return `${Math.floor(diff / 3600)}h ago`;
}

/** Safely coerce any API response to DriverNotificationData[] */
function toNotifArray(data: unknown): DriverNotificationData[] {
  if (Array.isArray(data)) {return data as DriverNotificationData[];}
  // Some APIs wrap in { data: [...] } or { notifications: [...] }
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) {return d.data as DriverNotificationData[];}
    if (Array.isArray(d.notifications)) {return d.notifications as DriverNotificationData[];}
  }
  return [];
}

/** Safely coerce any API response to AvailableBooking[] */
function toBookingArray(data: unknown): AvailableBooking[] {
  if (Array.isArray(data)) {return data as AvailableBooking[];}
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) {return d.data as AvailableBooking[];}
    if (Array.isArray(d.bookings)) {return d.bookings as AvailableBooking[];}
  }
  return [];
}

const NOTIF_ICON: Record<DriverNotificationData['type'], string> = {
  approval: 'checkmark-circle',
  rejection: 'close-circle',
  payment: 'cash',
  weekly_earnings: 'bar-chart',
  general: 'notifications',
};

const NOTIF_COLOR: Record<DriverNotificationData['type'], string> = {
  approval: '#16A34A',
  rejection: '#DC2626',
  payment: '#2563EB',
  weekly_earnings: '#7C3AED',
  general: '#6B7280',
};

export default function NotificationsScreen({navigation}: any) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [notifications, setNotifications] = useState<DriverNotificationData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const token = useAuthStore(s => s.token);

  // Unread count — shown as badge on notification icon from other screens
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Fetch available bookings ───────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const raw = await getAvailableBookings();
      if (mountedRef.current) {
        setBookings(toBookingArray(raw).map(apiToItem));
      }
    } catch (err) {
      console.warn('fetchBookings error:', err);
      if (mountedRef.current) {setBookings([]);}
    } finally {
      if (mountedRef.current) {setLoadingBookings(false);}
    }
  }, []);

  // ── Fetch system notifications ─────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const raw = await getNotifications();
      if (mountedRef.current) {
        setNotifications(toNotifArray(raw));
        markNotificationsRead().catch(() => {});
      }
    } catch (err) {
      console.warn('fetchNotifications error:', err);
      if (mountedRef.current) {setNotifications([]);}
    } finally {
      if (mountedRef.current) {setLoadingNotifs(false);}
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBookings();
    fetchNotifications();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchBookings, fetchNotifications]);

  // ── Real-time socket events ────────────────────────────────────
  useEffect(() => {
    if (!token) {return;}

    onBookingAvailable(offer => {
      if (!mountedRef.current || !offer) {return;}
      setBookings(prev => {
        const safeArr = Array.isArray(prev) ? prev : [];
        if (safeArr.some(i => i.bookingId === offer.bookingId)) {return safeArr;}
        return [offerToItem(offer), ...safeArr];
      });
    });

    onBookingTaken(bookingId => {
      if (!mountedRef.current || !bookingId) {return;}
      setBookings(prev =>
        (Array.isArray(prev) ? prev : []).filter(i => i.bookingId !== bookingId),
      );
    });

    onNewNotification(notif => {
      if (!mountedRef.current || !notif) {return;}
      setNotifications(prev => {
        const safeArr = Array.isArray(prev) ? prev : [];
        if (safeArr.some(n => n.id === notif.id)) {return safeArr;}
        return [{...notif, read: false}, ...safeArr];
      });
    });

    return () => {
      offBookingAvailable();
      offBookingTaken();
      offNewNotification();
    };
  }, [token]);

  // ── Accept handler ─────────────────────────────────────────────
  const handleAccept = useCallback(
    async (item: BookingItem) => {
      if (accepting) {return;}
      setBookings(prev => (Array.isArray(prev) ? prev : []).filter(i => i.bookingId !== item.bookingId));
      setAccepting(item.bookingId);
      try {
        const vehicles = await getMyVehicles();
        if (!vehicles || vehicles.length === 0) {
          Alert.alert('No Vehicle', 'Add a vehicle first to accept bookings.');
          setBookings(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
          return;
        }
        const result = await acceptBooking(item.bookingId, vehicles[0].id);
        if (typeof result === 'string') {
          Alert.alert('Could Not Accept', result);
          setBookings(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
        } else {
          Alert.alert('Accepted!', 'Head to the pickup location.');
        }
      } catch {
        Alert.alert('Error', 'Something went wrong. Please try again.');
        setBookings(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
      } finally {
        if (mountedRef.current) {setAccepting(null);}
      }
    },
    [accepting],
  );

  const handleRefresh = useCallback(() => {
    fetchBookings();
    fetchNotifications();
  }, [fetchBookings, fetchNotifications]);

  const isLoading = loadingBookings || loadingNotifs;

  // ── UI ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Ionicons name="refresh" size={moderateScale(22)} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* ── Available Bookings Section ── */}
          <Text style={styles.sectionLabel}>
            Available Bookings
            {bookings.length > 0 ? ` · ${bookings.length}` : ''}
          </Text>

          {bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={moderateScale(36)}
                color="#D1D5DB"
              />
              <Text style={styles.emptyText}>No bookings right now</Text>
            </View>
          ) : (
            bookings.map(item => (
              <View key={item.bookingId} style={styles.card}>
                {item.vehicleType ? (
                  <View style={styles.vehicleBadge}>
                    <Text style={styles.vehicleBadgeText}>
                      {item.vehicleType.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.locationRow}>
                  <View style={styles.dotCol}>
                    <View style={styles.dotGreen} />
                    <View style={styles.connectLine} />
                    <View style={styles.dotRed} />
                  </View>
                  <View style={styles.locationTexts}>
                    <View style={styles.locationBlock}>
                      <Text style={styles.locLabel}>PICKUP</Text>
                      <Text style={styles.locValue} numberOfLines={2}>
                        {item.pickup}
                      </Text>
                    </View>
                    <View style={styles.locationBlock}>
                      <Text style={styles.locLabel}>DROP</Text>
                      <Text style={styles.locValue} numberOfLines={2}>
                        {item.drop}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{item.distance} km</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, {color: '#16A34A'}]}>
                      Earnings
                    </Text>
                    <Text style={[styles.statValue, {color: '#16A34A'}]}>
                      ₹{item.fare}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Posted</Text>
                    <Text style={styles.statValue}>{timeAgo(item.arrivedAt)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.acceptBtn,
                    accepting === item.bookingId && styles.acceptBtnDisabled,
                  ]}
                  onPress={() => handleAccept(item)}
                  disabled={!!accepting}
                  activeOpacity={0.8}>
                  <Text style={styles.acceptBtnText}>
                    {accepting === item.bookingId ? 'Accepting…' : 'Accept Booking'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* ── System Notifications Section ── */}
          <Text style={[styles.sectionLabel, {marginTop: verticalScale(20)}]}>
            Alerts &amp; Updates
            {notifications.length > 0 ? ` · ${notifications.length}` : ''}
          </Text>

          {notifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="notifications-off-outline"
                size={moderateScale(36)}
                color="#D1D5DB"
              />
              <Text style={styles.emptyText}>No alerts yet</Text>
            </View>
          ) : (
            notifications.map(notif => (
              <View
                key={notif.id}
                style={[
                  styles.notifCard,
                  !notif.read && styles.notifCardUnread,
                ]}>
                <View
                  style={[
                    styles.notifIconWrap,
                    {backgroundColor: `${NOTIF_COLOR[notif.type]}18`},
                  ]}>
                  <Ionicons
                    name={NOTIF_ICON[notif.type]}
                    size={moderateScale(22)}
                    color={NOTIF_COLOR[notif.type]}
                  />
                </View>
                <View style={styles.notifBody}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge helper — export and use this on any screen that has a notification icon
// Example usage in HomeScreen:
//   import { NotificationBadgeIcon } from './NotificationsScreen';
//   <NotificationBadgeIcon count={unreadCount} onPress={...} />
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationBadgeIcon({
  count,
  onPress,
  size = 24,
  color = '#1C1C1E',
}: {
  count: number;
  onPress: () => void;
  size?: number;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      activeOpacity={0.7}
      style={{position: 'relative'}}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {count > 0 && (
        <View style={badgeStyles.badge}>
          <Text style={badgeStyles.badgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop:
      Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(10),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  headerBadge: {
    marginLeft: scale(6),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: scale(20),
    alignItems: 'center',
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: {
    fontSize: moderateScale(13),
    color: '#9CA3AF',
    marginTop: verticalScale(8),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  vehicleBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
  },
  dotCol: {
    alignItems: 'center',
    marginRight: scale(12),
    paddingTop: verticalScale(4),
  },
  dotGreen: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#34C759',
  },
  connectLine: {
    width: 2,
    flex: 1,
    minHeight: verticalScale(20),
    backgroundColor: '#D1D5DB',
    marginVertical: verticalScale(4),
  },
  dotRed: {
    width: moderateScale(10),
    height: moderateScale(10),
    backgroundColor: '#FF3B30',
    borderRadius: moderateScale(2),
  },
  locationTexts: {flex: 1},
  locationBlock: {marginBottom: verticalScale(8)},
  locLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locValue: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: verticalScale(2),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(12),
    padding: scale(12),
    marginBottom: verticalScale(12),
  },
  statItem: {flex: 1, alignItems: 'center'},
  divider: {
    width: 1,
    height: verticalScale(28),
    backgroundColor: '#D1D5DB',
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: verticalScale(2),
  },
  acceptBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  acceptBtnText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  notifIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  notifBody: {flex: 1},
  notifTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    flex: 1,
    marginRight: scale(8),
  },
  notifTime: {
    fontSize: moderateScale(12),
    fontFamily: 'Poppins-Regular',
    color: '#8E8E93',
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: moderateScale(14),
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: moderateScale(20),
  },
  unreadDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#3B82F6',
    marginLeft: scale(8),
    alignSelf: 'flex-start',
    marginTop: verticalScale(4),
  },
});