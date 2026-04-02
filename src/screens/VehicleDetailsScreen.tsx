import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Dimensions, Platform, ActivityIndicator,
} from 'react-native';
import { getMyVehicles, Vehicle } from '../services/driverService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (identical to ProfileScreen) ─────────────────────────────────────
const C = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  primary: '#1A56DB',
  primaryLight: '#EBF0FF',
  primaryMid: '#BFCFFF',
  headerBg: '#0F2D6B',
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  white: '#FFFFFF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#065F46',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberDark: '#92400E',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
};

export default function VehicleDetailsScreen({ navigation }: any) {
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const vehicle = vehicles.length > 0 ? vehicles[0] : null;
  const isBike = vehicle?.vehicle_type?.toLowerCase() === 'bike';
  const isApproved = vehicle?.verification_status === 'approved';
  const isPending = vehicle?.verification_status === 'pending';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <View style={styles.heroHeader}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={moderateScale(18)} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.screenLabel}>VEHICLE DETAILS</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Vehicle icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons
                name={isBike ? 'bicycle-outline' : 'car-outline'}
                size={moderateScale(34)}
                color={C.white}
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {vehicle
              ? (vehicle.vehicle_type
                  ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)
                  : 'Vehicle')
              : 'No Vehicle'}
          </Text>

          {/* Status pill */}
          {vehicle && (
            <View style={[
              styles.statusPill,
              !isApproved && { borderColor: 'rgba(245,158,11,0.3)' },
            ]}>
              <View style={[styles.statusDot, { backgroundColor: isApproved ? C.green : C.amber }]} />
              <Text style={styles.statusText}>
                {vehicle.verification_status
                  ? vehicle.verification_status.charAt(0).toUpperCase() + vehicle.verification_status.slice(1)
                  : 'Pending'}
              </Text>
            </View>
          )}
        </View>

        {vehicle ? (
          <>
            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: C.primaryLight }]}>
                  <Ionicons name="card-outline" size={moderateScale(18)} color={C.primary} />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>
                  {vehicle.registration_number?.toUpperCase() || 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Reg. Number</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: C.greenLight }]}>
                  <Ionicons name="barbell-outline" size={moderateScale(18)} color={C.greenDark} />
                </View>
                <Text style={[styles.statValue, { color: C.green }]}>
                  {vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
            </View>

            {/* ── Vehicle Information ───────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>VEHICLE INFORMATION</Text>
            </View>

            <View style={styles.menuCard}>
              <DetailRow
                icon="car-sport-outline"
                iconBg={C.primaryLight}
                iconColor={C.primary}
                label="Make & Model"
                value={vehicle.vehicle_model || 'N/A'}
              />
              <DetailRow
                icon="document-text-outline"
                iconBg={C.primaryLight}
                iconColor={C.primary}
                label="Registration Number"
                value={vehicle.registration_number?.toUpperCase() || 'N/A'}
              />
              <DetailRow
                icon="layers-outline"
                iconBg={C.primaryLight}
                iconColor={C.primary}
                label="Vehicle Type"
                value={vehicle.vehicle_type
                  ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)
                  : 'N/A'}
              />
              <DetailRow
                icon="barbell-outline"
                iconBg={C.greenLight}
                iconColor={C.greenDark}
                label="Capacity"
                value={vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}
                isLast
              />
            </View>

            {/* ── Documents ─────────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DOCUMENTS</Text>
            </View>

            <View style={styles.menuCard}>
              <DocumentRow
                icon="ribbon-outline"
                label="RC Book"
                status={vehicle.rc_document_url ? 'Uploaded' : 'Pending'}
                uploaded={!!vehicle.rc_document_url}
              />
              <DocumentRow
                icon="shield-checkmark-outline"
                label="Insurance"
                status={vehicle.insurance_document_url ? 'Uploaded' : 'Pending'}
                uploaded={!!vehicle.insurance_document_url}
                isLast
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="car-outline" size={moderateScale(36)} color={C.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No vehicle registered</Text>
            <Text style={styles.emptySubtitle}>Add your vehicle details to start accepting deliveries.</Text>
          </View>
        )}

        {/* ── Add Vehicle Button ─────────────────────────────────────────── */}
        {/* <TouchableOpacity style={styles.addVehicleButton} activeOpacity={0.7}>
          <View style={styles.addVehicleInner}>
            <Ionicons name="add-circle-outline" size={moderateScale(18)} color={C.primary} style={{ marginRight: scale(8) }} />
            <Text style={styles.addVehicleText}>Add Another Vehicle</Text>
          </View>
        </TouchableOpacity> */}

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────
const DetailRow = ({ icon, iconBg, iconColor, label, value, isLast }: any) => (
  <View style={[styles.menuItem, isLast && styles.menuItemLast]}>
    <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={moderateScale(18)} color={iconColor} />
    </View>
    <View style={styles.menuLabelBlock}>
      <Text style={styles.menuSub}>{label}</Text>
      <Text style={styles.menuLabel}>{value}</Text>
    </View>
  </View>
);

// ─── DocumentRow ──────────────────────────────────────────────────────────────
const DocumentRow = ({ icon, label, status, uploaded, isLast }: any) => (
  <View style={[styles.menuItem, isLast && styles.menuItemLast]}>
    <View style={[styles.menuIconWrap, { backgroundColor: uploaded ? C.greenLight : C.amberLight }]}>
      <Ionicons name={icon} size={moderateScale(18)} color={uploaded ? C.greenDark : C.amberDark} />
    </View>
    <View style={styles.menuLabelBlock}>
      <Text style={styles.menuSub}>Document</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <View style={[
      styles.docBadge,
      { backgroundColor: uploaded ? C.greenLight : C.amberLight },
    ]}>
      <Ionicons
        name={uploaded ? 'checkmark-circle-outline' : 'time-outline'}
        size={moderateScale(12)}
        color={uploaded ? C.greenDark : C.amberDark}
        style={{ marginRight: scale(4) }}
      />
      <Text style={[styles.docBadgeText, { color: uploaded ? C.greenDark : C.amberDark }]}>
        {status}
      </Text>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: verticalScale(110),
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroHeader: {
    backgroundColor: C.headerBg,
    paddingTop: Platform.OS === 'ios' ? verticalScale(56) : verticalScale(44),
    paddingBottom: verticalScale(36),
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: moderateScale(32),
    borderBottomRightRadius: moderateScale(32),
  },
  decCircle1: {
    position: 'absolute',
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -scale(60),
    right: -scale(40),
  },
  decCircle2: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -scale(30),
    left: -scale(20),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  backButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  screenLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
  },
  heroIconRing: {
    width: moderateScale(94),
    height: moderateScale(94),
    borderRadius: moderateScale(47),
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  heroIconBox: {
    width: moderateScale(82),
    height: moderateScale(82),
    borderRadius: moderateScale(41),
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: moderateScale(isSmallDevice ? 20 : 23),
    fontWeight: '700',
    color: C.white,
    marginBottom: verticalScale(12),
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: scale(6),
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: scale(20),
    marginTop: verticalScale(-1),
    backgroundColor: C.surface,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(8),
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: verticalScale(16),
  },
  statIconWrap: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(11),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 13 : 15),
    fontWeight: '800',
    color: C.primary,
    marginBottom: verticalScale(2),
    textAlign: 'center',
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: C.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.4,
  },

  // ── Menu card ─────────────────────────────────────────────────────────────
  menuCard: {
    backgroundColor: C.surface,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: verticalScale(64),
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  menuLabelBlock: {
    flex: 1,
  },
  menuSub: {
    fontSize: moderateScale(12),
    color: C.textMuted,
    marginBottom: verticalScale(2),
  },
  menuLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },

  // ── Document badge ────────────────────────────────────────────────────────
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  docBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(48),
    paddingHorizontal: scale(32),
  },
  emptyIconBox: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: C.text,
    marginBottom: verticalScale(6),
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(19),
  },

  // ── Add vehicle button ────────────────────────────────────────────────────
  addVehicleButton: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    backgroundColor: C.surface,
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
    minHeight: verticalScale(54),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addVehicleInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addVehicleText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.primary,
    letterSpacing: -0.1,
  },

  // ── Version ───────────────────────────────────────────────────────────────
  versionNote: {
    textAlign: 'center',
    fontSize: moderateScale(11),
    color: C.textMuted,
    fontWeight: '400',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(4),
  },
});