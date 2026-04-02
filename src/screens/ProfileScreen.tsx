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

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  primary: '#1A56DB',
  primaryLight: '#EBF0FF',
  primaryMid: '#BFCFFF',
  headerBg: '#0F2D6B',
  headerSurface: '#162E6E',
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  white: '#FFFFFF',
  starYellow: '#F59E0B',
  green: '#10B981',
};

// ─── Menu config ─────────────────────────────────────────────────────────────
const MENU_SECTIONS = [
  {
    title: 'ACCOUNT',
    items: [
      {icon: 'car-outline',                 label: 'Vehicle Details',   route: 'VehicleDetails'},
      {icon: 'business-outline',            label: 'Bank Details',      route: 'BankDetails'},
      {icon: 'star-outline',                label: 'Ratings & Reviews', route: 'RatingsReviews'},
      {icon: 'calendar-outline',            label: 'Attendance',        route: 'Attendance'},
      {icon: 'settings-outline',            label: 'Settings',          route: 'Settings'},
      {icon: 'chatbubble-ellipses-outline', label: 'Support',           route: 'Support'},
      {icon: 'information-circle-outline',  label: 'About Us',          route: 'AboutUs'},
    ],
  },
  {
    title: 'POLICIES & LEGAL',
    items: [
      {icon: 'shield-checkmark-outline', label: 'Privacy Policy',      route: 'PrivacyPolicy'},
      {icon: 'document-text-outline',    label: 'Terms & Conditions',  route: 'TermsCondition'},   // ← fixed
      {icon: 'clipboard-outline',        label: 'Conduct Policy',      route: 'ConductPolicy'},
      {icon: 'close-circle-outline',     label: 'Cancellation Policy', route: 'CancellationPolicy'},
      {icon: 'card-outline',             label: 'Payment Policy',      route: 'PaymentPolicy'},
    ],
  },
];

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

  const displayName =
    profile?.name ||
    (profile as any)?.user?.name ||
    user?.name ||
    'Driver Partner';
  const displayPhone =
    profile?.phone ||
    (profile as any)?.user?.phone ||
    user?.phone ||
    'No phone provided';
  const rating = profile?.average_rating
    ? Number(profile.average_rating).toFixed(1)
    : 'New';
  const totalTrips = profile?.total_trips || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <View style={styles.heroHeader}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          <Text style={styles.screenLabel}>MY PROFILE</Text>

          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.phonePill}>
            <Ionicons
              name="call-outline"
              size={moderateScale(12)}
              color={C.primaryMid}
              style={{marginRight: scale(5)}}
            />
            <Text style={styles.phone}>{displayPhone}</Text>
          </View>

          <View style={styles.ratingBadge}>
            <Ionicons
              name="star"
              size={moderateScale(13)}
              color={C.starYellow}
              style={{marginRight: scale(4)}}
            />
            <Text style={styles.ratingValue}>{rating}</Text>
            <Text style={styles.ratingLabel}>  ·  Rating</Text>
          </View>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardLeft]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="cube-outline" size={moderateScale(20)} color={C.primary} />
            </View>
            <Text style={styles.statValue}>{totalTrips}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={[styles.statCard, styles.statCardRight]}>
            <View style={[styles.statIconWrap, {backgroundColor: '#ECFDF5'}]}>
              <Ionicons name="wallet-outline" size={moderateScale(20)} color={C.green} />
            </View>
            <Text style={[styles.statValue, {color: C.green}]}>
              {profile?.wallet_balance ? `₹${profile.wallet_balance}` : '₹0'}
            </Text>
            <Text style={styles.statLabel}>Wallet Balance</Text>
          </View>
        </View>

        {/* ── Menu Sections ─────────────────────────────────────────────────── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <MenuItem
                  key={item.route}
                  icon={item.icon}
                  label={item.label}
                  isLast={index === section.items.length - 1}
                  onPress={() => navigation.navigate(item.route)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ───────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Ionicons
            name="log-out-outline"
            size={moderateScale(18)}
            color={C.danger}
            style={{marginRight: scale(8)}}
          />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────
const MenuItem = ({icon, label, onPress, isLast}: any) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && styles.menuItemLast]}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.menuIconWrap}>
      <Ionicons name={icon} size={moderateScale(19)} color={C.primary} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <View style={styles.menuArrowWrap}>
      <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
    </View>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scrollContent: {paddingBottom: verticalScale(110)},

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
    position: 'absolute', width: scale(200), height: scale(200),
    borderRadius: scale(100), backgroundColor: 'rgba(255,255,255,0.04)',
    top: -scale(60), right: -scale(40),
  },
  decCircle2: {
    position: 'absolute', width: scale(140), height: scale(140),
    borderRadius: scale(70), backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -scale(30), left: -scale(20),
  },
  screenLabel: {
    fontSize: moderateScale(11), fontWeight: '700',
    color: 'rgba(255,255,255,0.45)', letterSpacing: 2,
    marginBottom: verticalScale(20),
  },
  avatarRing: {
    width: moderateScale(94), height: moderateScale(94),
    borderRadius: moderateScale(47), borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center',
    alignItems: 'center', marginBottom: verticalScale(14),
  },
  avatar: {
    width: moderateScale(82), height: moderateScale(82),
    borderRadius: moderateScale(41), backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    fontSize: moderateScale(30), fontWeight: '800',
    color: C.white, letterSpacing: 1,
  },
  name: {
    fontSize: moderateScale(isSmallDevice ? 20 : 23), fontWeight: '700',
    color: C.white, marginBottom: verticalScale(6), letterSpacing: -0.3,
  },
  phonePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: moderateScale(20),
    paddingHorizontal: scale(14), paddingVertical: verticalScale(5),
    marginBottom: verticalScale(14), borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  phone: {
    fontSize: moderateScale(13), color: 'rgba(255,255,255,0.75)',
    fontWeight: '500', letterSpacing: 0.3,
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: moderateScale(20),
    paddingHorizontal: scale(14), paddingVertical: verticalScale(5),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  ratingValue: {fontSize: moderateScale(14), fontWeight: '700', color: C.white},
  ratingLabel: {
    fontSize: moderateScale(12), color: 'rgba(255,255,255,0.55)', fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row', marginHorizontal: scale(20), marginTop: verticalScale(-1),
    backgroundColor: C.surface, borderRadius: moderateScale(16),
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#0F172A', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4, overflow: 'hidden',
  },
  statCard: {
    flex: 1, alignItems: 'center',
    paddingVertical: verticalScale(20), paddingHorizontal: scale(8),
  },
  statCardLeft: {},
  statCardRight: {},
  statDivider: {width: 1, backgroundColor: C.border, marginVertical: verticalScale(16)},
  statIconWrap: {
    width: moderateScale(38), height: moderateScale(38),
    borderRadius: moderateScale(11), backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24), fontWeight: '800',
    color: C.primary, marginBottom: verticalScale(2),
  },
  statLabel: {
    fontSize: moderateScale(11), color: C.textMuted,
    fontWeight: '500', textAlign: 'center', letterSpacing: 0.2,
  },

  sectionHeader: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(11), fontWeight: '700',
    color: C.textMuted, letterSpacing: 1.4,
  },

  menuCard: {
    backgroundColor: C.surface, marginHorizontal: scale(20),
    borderRadius: moderateScale(16), borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06,
    shadowRadius: 10, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: verticalScale(14), paddingHorizontal: scale(16),
    borderBottomWidth: 1, borderBottomColor: C.border,
    minHeight: verticalScale(58),
  },
  menuItemLast: {borderBottomWidth: 0},
  menuIconWrap: {
    width: moderateScale(36), height: moderateScale(36),
    borderRadius: moderateScale(10), backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: scale(14),
  },
  menuLabel: {
    flex: 1, fontSize: moderateScale(15), fontWeight: '600',
    color: C.text, letterSpacing: -0.1,
  },
  menuArrowWrap: {
    width: moderateScale(28), height: moderateScale(28),
    borderRadius: moderateScale(8), backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
  },

  logoutButton: {
    flexDirection: 'row', margin: scale(20), marginTop: verticalScale(20),
    backgroundColor: C.dangerLight, paddingVertical: verticalScale(15),
    borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center',
    minHeight: verticalScale(52), borderWidth: 1, borderColor: '#FECACA',
    shadowColor: C.danger, shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  logoutText: {
    fontSize: moderateScale(15), fontWeight: '700',
    color: C.danger, letterSpacing: 0.1,
  },

  versionNote: {
    textAlign: 'center', fontSize: moderateScale(11),
    color: C.textMuted, fontWeight: '400', paddingBottom: verticalScale(4),
  },
});