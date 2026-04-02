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
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  white: '#FFFFFF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#065F46',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOR_RIDERS = [
  {
    icon: 'time-outline',
    label: 'Work Anytime, Anywhere',
    desc: 'Set your own schedule and deliver on your terms — total flexibility, zero commitment.',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
  },
  {
    icon: 'cash-outline',
    label: 'Earn on Every Delivery',
    desc: 'Get paid for every completed order with full transparency on your earnings.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'bicycle-outline',
    label: 'Multiple Vehicle Options',
    desc: 'Ride with a bicycle, scooter, or motorcycle — whatever works best for you.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    icon: 'flash-outline',
    label: 'Fast & Secure Payouts',
    desc: 'Your earnings are processed quickly and deposited directly to your bank account.',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
  },
];

const WHY_ZIPTO = [
  {
    icon: 'calendar-outline',
    label: 'No Fixed Schedule',
    desc: 'Log in when you want, log out when you need. Your time is entirely yours.',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
  },
  {
    icon: 'bar-chart-outline',
    label: 'Full Earning Transparency',
    desc: 'See a detailed breakdown of every rupee — base fee, distance pay, bonuses, and deductions.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'headset-outline',
    label: 'Support Whenever You Need',
    desc: 'Our rider support team is available around the clock to help you through any issue.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
];

const SOCIAL_LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'ridezipto',
    icon: 'logo-linkedin',
    xLogo: false,
    iconBg: '#E8F0FE',
    iconColor: '#0A66C2',
    url: 'https://www.linkedin.com/company/zipto-com/',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@ridezipto',
    icon: 'logo-instagram',
    xLogo: false,
    iconBg: '#FDF2F8',
    iconColor: '#C2185B',
    url: 'https://www.instagram.com/ridezipto?igsh=ZDNldGp6YjN2YXZx',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    handle: '@ridezipto',
    icon: null,        // ← no Ionicons icon; rendered as 𝕏 text
    xLogo: true,       // ← flag to render X text logo
    iconBg: '#000000', // ← X brand black
    iconColor: '#FFFFFF',
    url: 'https://x.com/ridezipto',
  },
];

const CONTACT_DETAILS = [
  {
    icon: 'mail-outline',
    label: 'Email Us',
    value: 'contact@ridezipto.com',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    onPress: () => Linking.openURL('mailto:contact@ridezipto.com'),
  },
  {
    icon: 'call-outline',
    label: 'Call Us',
    value: '+91 90900 29996',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
    onPress: () => Linking.openURL('tel:9090029996'),
  },
  {
    icon: 'location-outline',
    label: 'Office Address',
    value:
      'Plot No-781, Maharishi College Rd,\nin front of DN Kingsland, Saheed Nagar,\nBhubaneswar, Odisha 751007',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
    onPress: () =>
      Linking.openURL(
        'https://maps.google.com/?q=Plot+No-781,+Maharishi+College+Rd,+Saheed+Nagar,+Bhubaneswar,+Odisha+751007',
      ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutUsScreen({navigation}: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <View style={styles.heroHeader}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              activeOpacity={0.7}>
              <Ionicons
                name="arrow-back"
                size={moderateScale(18)}
                color={C.white}
              />
            </TouchableOpacity>
            <Text style={styles.screenLabel}>ABOUT US</Text>
            <View style={{width: moderateScale(36)}} />
          </View>

          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons
                name="rocket-outline"
                size={moderateScale(34)}
                color={C.white}
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>About Zipto</Text>

          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Delivery made simple & fast</Text>
          </View>
        </View>

        {/* ── About Zipto Banner ───────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WHO WE ARE</Text>
        </View>

        <View style={styles.summaryBanner}>
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.menuIconWrap,
                {backgroundColor: C.primaryLight, marginRight: scale(12)},
              ]}>
              <Ionicons
                name="storefront-outline"
                size={moderateScale(19)}
                color={C.primary}
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryTitle}>Fast-Growing Platform</Text>
              <Text style={styles.summarySub}>
                Zipto connects riders with flexible earning opportunities,
                making delivery simple and accessible for everyone.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Mission Banner ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>OUR MISSION</Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionIconRow}>
            <View style={styles.missionIconWrap}>
              <Ionicons
                name="flag-outline"
                size={moderateScale(22)}
                color={C.white}
              />
            </View>
          </View>
          <Text style={styles.missionText}>
            "To make delivery simple, fast, and accessible for everyone while
            helping riders earn better."
          </Text>
        </View>

        {/* ── For Riders ──────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FOR RIDERS</Text>
        </View>

        <View style={styles.menuCard}>
          {FOR_RIDERS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === FOR_RIDERS.length - 1 && styles.menuItemLast,
              ]}>
              <View
                style={[styles.menuIconWrap, {backgroundColor: item.iconBg}]}>
                <Ionicons
                  name={item.icon}
                  size={moderateScale(19)}
                  color={item.iconColor}
                />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.desc}</Text>
              </View>
              <View style={styles.greenBadge}>
                <Ionicons
                  name="checkmark"
                  size={moderateScale(13)}
                  color={C.green}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Why Zipto ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WHY ZIPTO</Text>
        </View>

        <View style={styles.menuCard}>
          {WHY_ZIPTO.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === WHY_ZIPTO.length - 1 && styles.menuItemLast,
              ]}>
              <View
                style={[styles.menuIconWrap, {backgroundColor: item.iconBg}]}>
                <Ionicons
                  name={item.icon}
                  size={moderateScale(19)}
                  color={item.iconColor}
                />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Social Media ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FOLLOW US</Text>
        </View>

        <View style={styles.menuCard}>
          {SOCIAL_LINKS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === SOCIAL_LINKS.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => item.url ? Linking.openURL(item.url) : null}
              activeOpacity={0.7}>
              {/* Icon — X uses text logo, others use Ionicons */}
              <View
                style={[styles.menuIconWrap, {backgroundColor: item.iconBg}]}>
                {item.xLogo ? (
                  <Text style={[styles.xLogoText, {color: item.iconColor}]}>
                    𝕏
                  </Text>
                ) : (
                  <Ionicons
                    name={item.icon!}
                    size={moderateScale(19)}
                    color={item.iconColor}
                  />
                )}
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={[styles.menuSub, styles.linkText]}>
                  {item.handle}
                </Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons
                  name="chevron-forward"
                  size={moderateScale(16)}
                  color={C.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contact Us ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONTACT US</Text>
        </View>

        <View style={styles.menuCard}>
          {CONTACT_DETAILS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === CONTACT_DETAILS.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View
                style={[styles.menuIconWrap, {backgroundColor: item.iconBg}]}>
                <Ionicons
                  name={item.icon}
                  size={moderateScale(19)}
                  color={item.iconColor}
                />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.menuSub,
                    item.icon !== 'location-outline' && styles.linkText,
                  ]}>
                  {item.value}
                </Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons
                  name="chevron-forward"
                  size={moderateScale(16)}
                  color={C.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scrollContent: {paddingBottom: verticalScale(110)},

  // ── Hero ────────────────────────────────────────────────────────────────
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
  greenDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: C.green},
  statusText: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  // ── Section header ───────────────────────────────────────────────────────
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

  // ── Summary banner ───────────────────────────────────────────────────────
  summaryBanner: {
    backgroundColor: C.surface,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  summaryRow: {flexDirection: 'row', alignItems: 'flex-start'},
  summaryTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  summarySub: {
    fontSize: moderateScale(12),
    color: C.textMuted,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(17),
  },

  // ── Mission card ─────────────────────────────────────────────────────────
  missionCard: {
    backgroundColor: C.headerBg,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  missionIconRow: {
    marginBottom: verticalScale(12),
  },
  missionIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionText: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.88)',
    lineHeight: moderateScale(22),
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // ── Menu card ────────────────────────────────────────────────────────────
  menuCard: {
    backgroundColor: C.surface,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
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
  menuItemLast: {borderBottomWidth: 0},
  menuIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  menuLabelBlock: {flex: 1, marginRight: scale(8)},
  menuLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  menuSub: {
    fontSize: moderateScale(12),
    color: C.textMuted,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(17),
  },
  linkText: {
    color: C.primary,
    fontWeight: '500',
  },
  menuArrowWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── X logo text ──────────────────────────────────────────────────────────
  xLogoText: {
    fontSize: moderateScale(16),
    fontWeight: '900',
    lineHeight: moderateScale(20),
  },

  // ── Badges ───────────────────────────────────────────────────────────────
  greenBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: C.greenLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Version ──────────────────────────────────────────────────────────────
  versionNote: {
    textAlign: 'center',
    fontSize: moderateScale(11),
    color: C.textMuted,
    fontWeight: '400',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(4),
  },
});