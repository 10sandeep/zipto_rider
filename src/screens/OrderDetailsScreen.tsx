import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
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

export default function OrderDetailsScreen({route, navigation}: any) {
  const {orderId} = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{width: moderateScale(24)}} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>{orderId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>● In Progress</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>ABC Store</Text>
              <Text style={styles.locationAddress}>
                MG Road, Bangalore - 560001
              </Text>
              <Text style={styles.locationContact}>
                Contact: +91 98765 43210
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>🎯</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>John Doe</Text>
              <Text style={styles.locationAddress}>
                123 Main Street, Chennai - 600001
              </Text>
              <Text style={styles.locationContact}>
                Contact: +91 98765 12345
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Package Type" value="Documents" />
            <DetailRow label="Weight" value="2 kg" />
            <DetailRow label="Distance" value="5.2 km" />
            <DetailRow label="Payment Method" value="Cash on Delivery" />
            <DetailRow label="Delivery Fee" value="₹250" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.callButton}
          activeOpacity={0.7}
        >
          <Text style={styles.callButtonText}>📞 Call Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => navigation.navigate('Navigation', {orderId})}
          activeOpacity={0.8}
        >
          <Text style={styles.navigateButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DetailRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: moderateScale(18), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular', 
    color: '#1C1C1E'
  },
  content: {
    paddingHorizontal: scale(20), 
    paddingBottom: verticalScale(120)
  },
  orderIdCard: {
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderIdLabel: {
    fontSize: moderateScale(14), 
    color: '#8E8E93', 
    marginBottom: verticalScale(8)
  },
  orderIdValue: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  statusBadge: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  statusText: {
    fontSize: moderateScale(13), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#F59E0B'
  },
  section: {
    marginTop: verticalScale(20)
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: scale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIcon: {
    fontSize: moderateScale(24), 
    marginRight: scale(12)
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  locationAddress: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Regular', 
    color: '#666', 
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(20),
  },
  locationContact: {
    fontSize: moderateScale(13), 
    color: '#3B82F6', 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: verticalScale(40),
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(14), 
    color: '#666',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  detailValue: {
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: scale(12),
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(36) : verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(50),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  callButtonText: {
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E'
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(50),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navigateButtonText: {
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF'
  },
});