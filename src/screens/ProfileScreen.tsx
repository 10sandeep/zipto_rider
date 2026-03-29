import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuthStore} from '../store/authStore';

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

export default function ProfileScreen({navigation}: any) {
  const {user, profile, clearAuth} = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigation.replace('Welcome');
  };

  const getInitials = (name: string) => {
    if (!name) return 'PR';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = profile?.name || user?.name || 'Driver Partner';
  const displayPhone = profile?.phone || user?.phone || 'No phone provided';
  const rating = profile?.average_rating
    ? Number(profile.average_rating).toFixed(1)
    : 'New';
  const totalTrips = profile?.total_trips || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.phone}>{displayPhone}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {rating}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalTrips}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {profile?.wallet_balance ? `₹${profile.wallet_balance}` : '₹0'}
            </Text>
            <Text style={styles.statLabel}>Wallet Balance</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="🚗"
            label="Vehicle Details"
            onPress={() => navigation.navigate('VehicleDetails')}
          />
          <MenuItem
            icon="🏦"
            label="Bank Details"
            onPress={() => navigation.navigate('BankDetails')}
          />
          <MenuItem
            icon="⭐"
            label="Ratings & Reviews"
            onPress={() => navigation.navigate('RatingsReviews')}
          />
          <MenuItem
            icon="📅"
            label="Attendance"
            onPress={() => navigation.navigate('Attendance')}
          />
          <MenuItem
            icon="⚙️"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuItem
            icon="💬"
            label="Support"
            onPress={() => navigation.navigate('Support')}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const MenuItem = ({icon, label, onPress}: any) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: verticalScale(100),
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(30),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
  },
  name: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  phone: {
    fontSize: moderateScale(15),
    color: '#8E8E93',
    marginBottom: verticalScale(12),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  rating: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  ratingText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    gap: scale(12),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: verticalScale(100),
    justifyContent: 'center',
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 24 : 28),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(13),
    color: '#8E8E93',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: verticalScale(16),
    marginHorizontal: scale(20),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: verticalScale(60),
  },
  menuIcon: {
    fontSize: moderateScale(24),
    marginRight: scale(12),
  },
  menuLabel: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
  },
  logoutButton: {
    margin: scale(20),
    backgroundColor: '#FEF2F2',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(50),
    shadowColor: '#EF4444',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
  },
});
