import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {getMyVehicles, Vehicle} from '../services/driverService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

export default function VehicleDetailsScreen({navigation}: any) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getMyVehicles();
        setVehicles(data || []);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const vehicle = vehicles.length > 0 ? vehicles[0] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#3B82F6"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{width: moderateScale(24)}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {vehicle ? (
          <>
            <View style={styles.vehicleCard}>
              <Text style={styles.vehicleIcon}>
                {vehicle.vehicle_type?.toLowerCase() === 'bike' ? '🏍️' : '🚗'}
              </Text>
              <Text style={styles.vehicleType}>
                {vehicle.vehicle_type
                  ? vehicle.vehicle_type.charAt(0).toUpperCase() +
                    vehicle.vehicle_type.slice(1)
                  : 'Vehicle'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  vehicle.verification_status !== 'approved' && {
                    backgroundColor: '#FEF3C7',
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    vehicle.verification_status !== 'approved' && {
                      color: '#D97706',
                    },
                  ]}>
                  ●{' '}
                  {vehicle.verification_status
                    ? vehicle.verification_status.charAt(0).toUpperCase() +
                      vehicle.verification_status.slice(1)
                    : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <View style={styles.detailCard}>
                <DetailRow
                  label="Registration Number"
                  value={vehicle.registration_number?.toUpperCase() || 'N/A'}
                />
                <DetailRow
                  label="Make & Model"
                  value={vehicle.vehicle_model || 'N/A'}
                />
                <DetailRow
                  label="Capacity"
                  value={vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}
                />
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Documents</Text>
              <View style={styles.documentsList}>
                <DocumentItem
                  name="RC Book"
                  status={vehicle.rc_document_url ? 'Uploaded' : 'Pending'}
                />
                <DocumentItem
                  name="Insurance"
                  status={
                    vehicle.insurance_document_url ? 'Uploaded' : 'Pending'
                  }
                />
              </View>
            </View>
          </>
        ) : (
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{fontSize: 16, color: '#666'}}>
              No vehicles registered yet.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.addVehicleButton} activeOpacity={0.7}>
          <Text style={styles.addVehicleText}>+ Add Another Vehicle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const DetailRow = ({label, value}: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const DocumentItem = ({name, status, expires}: any) => (
  <View style={styles.documentItem}>
    <View style={styles.documentInfo}>
      <Text style={styles.documentName}>{name}</Text>
      {expires && <Text style={styles.documentExpiry}>{expires}</Text>}
    </View>
    <View style={styles.verifiedBadge}>
      <Text style={styles.verifiedText}>✓ {status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    color: '#1C1C1E',
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: verticalScale(100),
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    padding: scale(24),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleIcon: {
    fontSize: moderateScale(isSmallDevice ? 50 : 60),
    marginBottom: verticalScale(12),
  },
  vehicleType: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  statusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  statusText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#50C878',
  },
  detailsSection: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  detailCard: {
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
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: verticalScale(44),
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(14),
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    textAlign: 'right',
  },
  documentsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: verticalScale(70),
  },
  documentInfo: {
    flex: 1,
    marginRight: scale(12),
  },
  documentName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  documentExpiry: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
  },
  verifiedBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    flexShrink: 0,
  },
  verifiedText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#50C878',
  },
  addVehicleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    minHeight: verticalScale(54),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addVehicleText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
  },
});
