import React, {useState} from 'react';
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

const EARNING_TYPES = [
  {
    icon: 'receipt-outline',
    label: 'Base Delivery Fee',
    desc: 'A fixed amount earned for every successfully completed delivery.',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
  },
  {
    icon: 'navigate-outline',
    label: 'Distance-Based Earnings',
    desc: 'Additional pay calculated per kilometre travelled for longer routes.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'star-outline',
    label: 'Incentives & Bonuses',
    desc: 'Peak-hour boosts, streak rewards, and promotional bonuses applied automatically.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
];

const DEDUCTIONS = [
  {
    icon: 'layers-outline',
    label: 'Platform Commission',
    desc: 'A percentage of each delivery fee retained by Zipto to maintain platform operations.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
  {
    icon: 'cut-outline',
    label: 'Service Fees',
    desc: 'Any applicable service charges will be clearly itemised in your earnings breakdown.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
];

const PAYOUT_INFO = [
  {
    icon: 'calendar-outline',
    label: 'Payout Schedule',
    desc: "Payments are processed according to the platform's scheduled payout cycle.",
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'wallet-outline',
    label: 'Linked Bank Account',
    desc: 'Ensure your bank details are up to date in your profile to avoid payment delays.',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
  },
  {
    icon: 'document-text-outline',
    label: 'Earnings Breakdown',
    desc: 'A detailed statement of fees, deductions, and bonuses is available in your dashboard.',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
  },
];

const FAQS = [
  {
    question: 'How is my per-delivery earnings calculated?',
    answer:
      'Your earnings per delivery combine the base fee and a distance component. Bonuses are added on top if applicable. The full breakdown is visible before and after each delivery.',
  },
  {
    question: 'When will I receive my payout?',
    answer:
      "Payouts follow the platform's standard schedule. Processing times may vary depending on your bank. Check the Payments section of your dashboard for the next scheduled date.",
  },
  {
    question: 'Can platform fees change over time?',
    answer:
      'Zipto may revise commission rates or fees with prior notice. Any changes will be communicated via in-app notification and email before they take effect.',
  },
  {
    question: 'What if my payment is delayed or incorrect?',
    answer:
      'Contact our payments support team at payments@ridezipto.com with your earnings reference. Issues are typically investigated and resolved within 3 business days.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarningsScreen({navigation}: any) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    const url = Platform.OS === 'ios'
      ? `maps:?q=${encoded}`
      : `geo:0,0?q=${encoded}`;
    Linking.openURL(url);
  };

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
            <Text style={styles.screenLabel}>EARNINGS & PAYMENTS</Text>
            <View style={{width: moderateScale(36)}} />
          </View>

          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons
                name="cash-outline"
                size={moderateScale(34)}
                color={C.white}
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>Earnings & Payments</Text>

          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>
              Earn on every completed delivery
            </Text>
          </View>
        </View>

        {/* ── Last Updated ─────────────────────────────────────────────── */}
        <View style={styles.updateNote}>
          <Ionicons
            name="time-outline"
            size={moderateScale(13)}
            color={C.textMuted}
          />
          <Text style={styles.updateNoteText}>Last updated: April 1, 2025</Text>
        </View>

        {/* ── Earnings Summary Banner ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HOW YOU EARN</Text>
        </View>

        <View style={styles.summaryBanner}>
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.menuIconWrap,
                {backgroundColor: C.greenLight, marginRight: scale(12)},
              ]}>
              <Ionicons
                name="bicycle-outline"
                size={moderateScale(19)}
                color={C.greenDark}
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryTitle}>Completed Deliveries</Text>
              <Text style={styles.summarySub}>
                Income is based solely on deliveries you successfully complete —
                no completion, no pay.
              </Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.menuIconWrap,
                {backgroundColor: '#FEE2E2', marginRight: scale(12)},
              ]}>
              <Ionicons
                name="remove-circle-outline"
                size={moderateScale(19)}
                color="#991B1B"
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryTitle}>Deductions Apply</Text>
              <Text style={styles.summarySub}>
                Platform commission and service fees are deducted before your
                net payout is calculated.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Payment Types ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAYMENTS MAY INCLUDE</Text>
        </View>

        <View style={styles.menuCard}>
          {EARNING_TYPES.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === EARNING_TYPES.length - 1 && styles.menuItemLast,
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
                <Ionicons name="add" size={moderateScale(13)} color={C.green} />
              </View>
            </View>
          ))}
        </View>

        {/* ── Deductions ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>POSSIBLE DEDUCTIONS</Text>
        </View>

        <View style={styles.menuCard}>
          {DEDUCTIONS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === DEDUCTIONS.length - 1 && styles.menuItemLast,
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
              <View style={styles.dangerBadge}>
                <Ionicons
                  name="remove"
                  size={moderateScale(13)}
                  color={C.danger}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Payout Info ──────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAYOUT INFORMATION</Text>
        </View>

        <View style={styles.menuCard}>
          {PAYOUT_INFO.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === PAYOUT_INFO.length - 1 && styles.menuItemLast,
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

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED</Text>
        </View>

        <View style={styles.menuCard}>
          {FAQS.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.faqItem,
                index === FAQS.length - 1 && styles.menuItemLast,
              ]}
              onPress={() =>
                setExpandedFaq(expandedFaq === index ? null : index)
              }
              activeOpacity={0.7}>
              <View
                style={[
                  styles.menuIconWrap,
                  {backgroundColor: C.primaryLight},
                ]}>
                <Ionicons
                  name="help-circle-outline"
                  size={moderateScale(19)}
                  color={C.primary}
                />
              </View>
              <View style={styles.faqTextBlock}>
                <Text style={styles.menuLabel}>{faq.question}</Text>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={moderateScale(16)}
                  color={C.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contact Section ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONTACT US</Text>
        </View>

        <View style={styles.menuCard}>
          {/* Payments Support */}
          {/* <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleEmail('payments@ridezipto.com')}
            activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, {backgroundColor: C.greenLight}]}>
              <Ionicons
                name="mail-outline"
                size={moderateScale(19)}
                color={C.greenDark}
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Payments Support</Text>
              <Text style={[styles.menuSub, styles.linkText]}>
                payments@ridezipto.com
              </Text>
            </View>
            <View style={styles.menuArrowWrap}>
              <Ionicons
                name="chevron-forward"
                size={moderateScale(16)}
                color={C.textMuted}
              />
            </View>
          </TouchableOpacity> */}

          {/* Legal */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleEmail('ride.support@ridezipto.com')}
            activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, {backgroundColor: '#EDE9FE'}]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={moderateScale(19)}
                color="#5B21B6"
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Legal Enquiries</Text>
              <Text style={[styles.menuSub, styles.linkText]}>
                legal@ridezipto.com
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

          {/* Phone */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePhone('9090029996')}
            activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, {backgroundColor: C.primaryLight}]}>
              <Ionicons
                name="call-outline"
                size={moderateScale(19)}
                color={C.primary}
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Phone Support</Text>
              <Text style={[styles.menuSub, styles.linkText]}>
                +91 90900 29996
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

          {/* Address */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() =>
              handleMaps(
                'Plot No-781, Maharishi College Rd, Saheed Nagar, Bhubaneswar, Odisha 751007',
              )
            }
            activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, {backgroundColor: '#FEF3C7'}]}>
              <Ionicons
                name="location-outline"
                size={moderateScale(19)}
                color="#92400E"
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Office Address</Text>
              <Text style={styles.menuSub}>
                Plot No-781, Maharishi College Rd,{'\n'}
                in front of DN Kingsland, Saheed Nagar,{'\n'}
                Bhubaneswar, Odisha 751007
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

  // ── Update note ─────────────────────────────────────────────────────────
  updateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(2),
  },
  updateNoteText: {
    fontSize: moderateScale(11),
    color: C.textMuted,
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
  summaryDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: verticalScale(12),
  },
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

  // ── Badges ───────────────────────────────────────────────────────────────
  greenBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: C.greenLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: C.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  faqTextBlock: {flex: 1, marginRight: scale(8), paddingTop: verticalScale(2)},
  faqAnswer: {
    fontSize: moderateScale(13),
    color: C.textSub,
    marginTop: verticalScale(6),
    lineHeight: moderateScale(19),
    fontWeight: '400',
  },

  // ── Contact card (legacy, kept for compatibility) ─────────────────────────
  contactCard: {
    backgroundColor: C.surface,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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