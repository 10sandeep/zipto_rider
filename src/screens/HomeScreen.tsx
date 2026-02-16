import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function HomeScreen({navigation}: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    id: 'ORD12345',
    pickup: 'ABC Store, MG Road',
    delivery: '123 Main St, Chennai',
    distance: '5.2 km',
    amount: '₹250',
    pickupCoords: {
      latitude: 13.0827,
      longitude: 80.2707,
    },
    deliveryCoords: {
      latitude: 13.0569,
      longitude: 80.2425,
    },
  });

  const initialRegion = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map Background */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        {isOnline && (
          <>
            {/* Pickup Marker */}
            <Marker coordinate={currentOrder.pickupCoords}>
              <View style={styles.markerContainer}>
                <View style={styles.pickupMarker}>
                  <Ionicons
                    name="location"
                    size={moderateScale(24)}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.markerCallout}>
                  <Text style={styles.markerText}>Pickup</Text>
                  <Text style={styles.markerAddress}>
                    {currentOrder.pickup}
                  </Text>
                </View>
              </View>
            </Marker>

            {/* Delivery Marker */}
            <Marker coordinate={currentOrder.deliveryCoords}>
              <View style={styles.deliveryMarker}>
                <Ionicons
                  name="flag"
                  size={moderateScale(20)}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, Raj! 👋</Text>
          <Text style={styles.date}>Tuesday, Jan 27, 2026</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="notifications-outline"
            size={moderateScale(24)}
            color="#3B82F6"
          />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Content Overlay */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Online Toggle Card */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineCardLeft}>
            <Text style={styles.onlineTitle}>Go Online</Text>
            <Text style={styles.onlineSubtitle}>
              {isOnline ? 'Accepting orders' : 'Start accepting orders'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{false: '#E0E0E0', true: '#3B82F6'}}
            thumbColor="#FFFFFF"
            style={{
              transform: [
                {scaleX: Platform.OS === 'ios' ? 0.9 : 1},
                {scaleY: Platform.OS === 'ios' ? 0.9 : 1},
              ],
            }}
          />
        </View>

        {/* Active Order Card */}
        {isOnline && (
          <View style={styles.currentOrderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={moderateScale(24)}
                  color="#3B82F6"
                />
                <Text style={styles.currentOrderTitle}>Active Order</Text>
              </View>
              <View style={styles.amountBadge}>
                <Text style={styles.amountText}>{currentOrder.amount}</Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Ionicons
                  name="location"
                  size={moderateScale(18)}
                  color="#3B82F6"
                />
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>Pickup</Text>
                  <Text style={styles.orderValue}>{currentOrder.pickup}</Text>
                </View>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.orderRow}>
                <Ionicons
                  name="flag"
                  size={moderateScale(18)}
                  color="#16A34A"
                />
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>Delivery</Text>
                  <Text style={styles.orderValue}>{currentOrder.delivery}</Text>
                </View>
              </View>

              <View style={styles.distanceRow}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={moderateScale(18)}
                  color="#8E8E93"
                />
                <Text style={styles.distanceText}>{currentOrder.distance}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: currentOrder.id})
              }
              activeOpacity={0.8}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons
                name="arrow-forward"
                size={moderateScale(18)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={moderateScale(28)}
                color="#3B82F6"
              />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Today's Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="wallet-outline"
                size={moderateScale(28)}
                color="#16A34A"
              />
            </View>
            <Text style={styles.statValue}>₹2,850</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Attendance')}
              activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={moderateScale(28)}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.actionLabel}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={moderateScale(28)}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.actionLabel}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('RatingsReviews')}
              activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="star-outline"
                  size={moderateScale(28)}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.actionLabel}>Ratings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="settings-outline"
                  size={moderateScale(28)}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(20),
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    color: '#1C1C1E',
  },
  date: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    marginTop: verticalScale(4),
  },
  notificationButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100),
  },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: verticalScale(80),
  },
  onlineCardLeft: {
    flex: 1,
    paddingRight: scale(12),
  },
  onlineTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  onlineSubtitle: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
  },
  currentOrderCard: {
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(16),
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    flex: 1,
    paddingRight: scale(8),
  },
  currentOrderTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#3B82F6',
  },
  amountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  amountText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#3B82F6',
  },
  orderInfo: {
    marginBottom: verticalScale(16),
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  orderTextContainer: {
    flex: 1,
  },
  orderLabel: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  orderValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: moderateScale(20),
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: verticalScale(8),
    marginLeft: scale(32),
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  distanceText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    fontWeight: '600',
  },
  viewDetailsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
    minHeight: verticalScale(50),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(16),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    minHeight: verticalScale(120),
  },
  statIconContainer: {
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(13),
    color: '#8E8E93',
    textAlign: 'center',
  },
  quickActions: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(16),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  actionCard: {
    width: (SCREEN_WIDTH - scale(52)) / 2,
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    minHeight: verticalScale(130),
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  actionLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  // Map Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  pickupMarker: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryMarker: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerCallout: {
    backgroundColor: '#FFFFFF',
    padding: scale(12),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
    minWidth: scale(150),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: verticalScale(4),
  },
  markerAddress: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
});
