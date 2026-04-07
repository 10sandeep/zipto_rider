import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Dimensions, Platform, Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (identical to PrivacyPolicyScreen / SupportScreen) ──────────────
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
  greenLight: '#D1FAE5',
  greenDark: '#065F46',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROHIBITED = [
  {
    icon: 'cube-outline',
    label: 'Tamper with Packages',
    desc: 'Opening, altering, or damaging any delivery item is strictly prohibited.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
  {
    icon: 'person-remove-outline',
    label: 'Misuse Customer Information',
    desc: 'Using customer contact details or addresses for any unauthorised purpose.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    icon: 'warning-outline',
    label: 'Accept Illegal Items',
    desc: 'Knowingly collecting or transporting contraband or prohibited goods.',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
  },
  {
    icon: 'card-outline',
    label: 'Engage in Fraud',
    desc: 'Fabricating deliveries, manipulating earnings, or deceiving the platform.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
];

const EXPECTED = [
  {
    icon: 'checkmark-circle-outline',
    label: 'Handle with Care',
    desc: 'Treat every package as if it were your own valuable property.',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'people-outline',
    label: 'Respect All Parties',
    desc: 'Interact professionally with customers, merchants, and support staff.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'time-outline',
    label: 'Punctuality & Reliability',
    desc: 'Accept assignments you can complete and communicate any delays promptly.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
];

const CONSEQUENCES = [
  {
    question: 'What happens on a first violation?',
    answer:
      'Minor violations result in a formal warning and a temporary restriction on your delivery privileges. You will be notified via the app and email.',
  },
  {
    question: 'When does account suspension occur?',
    answer:
      'Repeated or serious breaches — such as fraud or accepting illegal items — lead to immediate account suspension pending a review by our compliance team.',
  },
  {
    question: 'Can a suspended account be reinstated?',
    answer:
      'Suspensions are reviewed on a case-by-case basis. Permanent removal is reserved for severe or repeated violations where reinstatement is not possible.',
  },
  {
    question: 'How do I report a concern?',
    answer:
      'Report policy violations or safety concerns via the in-app Support Centre or directly to rider.support@ridezipto.com. All reports are treated confidentially.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConductScreen({ navigation }: any) {
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
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ─────────────────────────────────────────────── */}
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
            <Text style={styles.screenLabel}>CONDUCT GUIDELINES</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Hero icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons name="ribbon-outline" size={moderateScale(34)} color={C.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Professional Conduct</Text>

          {/* Trust pill */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Uphold the Zipto standard on every ride</Text>
          </View>
        </View>

        {/* ── Last Updated Note ────────────────────────────────────────── */}
        <View style={styles.updateNote}>
          <Ionicons name="time-outline" size={moderateScale(13)} color={C.textMuted} />
          <Text style={styles.updateNoteText}>Last updated: April 1, 2025</Text>
        </View>

        {/* ── Prohibited Actions ───────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RIDERS MUST NOT</Text>
        </View>

        <View style={styles.menuCard}>
          {PROHIBITED.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === PROHIBITED.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.desc}</Text>
              </View>
              {/* Danger badge */}
              <View style={styles.dangerBadge}>
                <Ionicons name="close" size={moderateScale(12)} color={C.danger} />
              </View>
            </View>
          ))}
        </View>

        {/* ── Expected Behaviour ───────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WHAT WE EXPECT</Text>
        </View>

        <View style={styles.menuCard}>
          {EXPECTED.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === EXPECTED.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Consequences Banner ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONSEQUENCES OF VIOLATIONS</Text>
        </View>

        <View style={styles.consequenceBanner}>
          <View style={styles.consequenceRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2', marginRight: scale(12) }]}>
              <Ionicons name="alert-circle-outline" size={moderateScale(19)} color={C.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.consequenceTitle}>Account Suspension</Text>
              <Text style={styles.consequenceSub}>
                Violations may result in a temporary suspension pending a compliance review.
              </Text>
            </View>
          </View>
          <View style={styles.consequenceDivider} />
          <View style={styles.consequenceRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#1A56DB22', marginRight: scale(12) }]}>
              <Ionicons name="ban-outline" size={moderateScale(19)} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.consequenceTitle}>Permanent Removal</Text>
              <Text style={styles.consequenceSub}>
                Severe or repeated breaches will result in permanent removal from the platform.
              </Text>
            </View>
          </View>
        </View>

        {/* ── FAQ / Consequences Q&A ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED</Text>
        </View>

        <View style={styles.menuCard}>
          {CONSEQUENCES.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.faqItem,
                index === CONSEQUENCES.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: C.primaryLight }]}>
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

        {/* ── Contact Us ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HELP & COMPLIANCE</Text>
        </View>

        <View style={styles.menuCard}>
          {/* Conduct Team */}
          {/* <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleEmail('conduct@ridezipto.com')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="mail-outline" size={moderateScale(19)} color="#991B1B" />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Conduct Team</Text>
              <Text style={[styles.menuSub, styles.linkText]}>conduct@ridezipto.com</Text>
            </View>
            <View style={styles.menuArrowWrap}>
              <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
            </View>
          </TouchableOpacity> */}

          {/* Legal */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleEmail('ride.support@ridezipto.com')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="shield-checkmark-outline" size={moderateScale(19)} color="#5B21B6" />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Legal Enquiries</Text>
              <Text style={[styles.menuSub, styles.linkText]}>legal@ridezipto.com</Text>
            </View>
            <View style={styles.menuArrowWrap}>
              <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePhone('+91 9090029996')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: C.primaryLight }]}>
              <Ionicons name="call-outline" size={moderateScale(19)} color={C.primary} />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Phone Support</Text>
              <Text style={[styles.menuSub, styles.linkText]}>+91 90900 29996</Text>
            </View>
            <View style={styles.menuArrowWrap}>
              <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Address */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() =>
              handleMaps(
                'Bhubaneswar, Odisha 751007',
              )
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="location-outline" size={moderateScale(19)} color="#92400E" />
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
              <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles (mirrors PrivacyPolicyScreen exactly) ─────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: verticalScale(110),
  },

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
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
  },
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

  // ── Shared section header ────────────────────────────────────────────────
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

  // ── Menu card ────────────────────────────────────────────────────────────
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
    marginRight: scale(8),
  },
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

  // ── Danger badge ─────────────────────────────────────────────────────────
  dangerBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: C.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Consequence banner ───────────────────────────────────────────────────
  consequenceBanner: {
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
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consequenceDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: verticalScale(12),
  },
  consequenceTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  consequenceSub: {
    fontSize: moderateScale(12),
    color: C.textMuted,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(17),
  },

  // ── FAQ specific ─────────────────────────────────────────────────────────
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  faqTextBlock: {
    flex: 1,
    marginRight: scale(8),
    paddingTop: verticalScale(2),
  },
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
    shadowOffset: { width: 0, height: 3 },
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