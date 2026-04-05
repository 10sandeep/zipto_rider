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

// ─── Palette (identical across all screens) ───────────────────────────────────
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
  dangerLight: '#FEE2E2',
  white: '#FFFFFF',
  starYellow: '#F59E0B',
  green: '#10B981',
  greenLight: '#D1FAE5',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const WHEN_ALLOWED = [
  {
    icon: 'checkmark-circle-outline',
    label: 'Before Pickup Only',
    desc: 'Cancellations are permitted at any point before you collect the package from the merchant.',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'alert-circle-outline',
    label: 'Valid Reasons Apply',
    desc: 'Unexpected vehicle issues, safety concerns, or emergencies are considered valid grounds.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    label: 'Notify Support',
    desc: 'Always inform the support team when cancelling so the order can be reassigned quickly.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
];

const CONSEQUENCES = [
  {
    icon: 'trending-down-outline',
    label: 'Reduced Order Assignments',
    desc: 'High cancellation rates lower your priority score, resulting in fewer delivery requests.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    icon: 'pause-circle-outline',
    label: 'Temporary Account Suspension',
    desc: 'Persistent excessive cancellations may trigger a temporary suspension pending a review.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
];

const POST_PICKUP = [
  {
    icon: 'cube-outline',
    label: 'Complete Every Delivery',
    desc: 'Once a package is collected, you are expected to deliver it to the designated address.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'shield-outline',
    label: 'Safety Exceptions',
    desc: 'If a genuine safety concern arises mid-delivery, contact support before taking any action.',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'call-outline',
    label: 'Contact Support First',
    desc: 'Never abandon a delivery without speaking to our support team — we will guide you through next steps.',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
  },
];

const FAQS = [
  {
    question: 'What counts as an "excessive" cancellation rate?',
    answer:
      'A cancellation rate above 10% within any 7-day rolling period is flagged as excessive. You will receive an in-app warning before any action is taken.',
  },
  {
    question: 'Will emergency cancellations affect my score?',
    answer:
      'Cancellations submitted with a valid reason and verified by support are marked as excused and do not count toward your cancellation rate.',
  },
  {
    question: 'What if I cannot reach the delivery address?',
    answer:
      'Contact the customer via the app first, then reach out to support if unresolved. Do not cancel or return the parcel without support approval.',
  },
  {
    question: 'How can I see my current cancellation rate?',
    answer:
      'Your cancellation rate is visible in the Performance section of your rider dashboard, updated in real time after every completed or cancelled job.',
  },
];

const CONTACT_DETAILS = [
  {
    icon: 'mail-outline',
    label: 'Email Us',
    value: 'rider.support@ridezipto.com',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    onPress: () => Linking.openURL('mailto:rider.support@ridezipto.com'),
  },
  {
    icon: 'call-outline',
    label: 'Call Us',
    value: '+91 9090029996',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
    onPress: () => Linking.openURL('tel:+91 9090029996'),
  },
  {
    icon: 'location-outline',
    label: 'Our Address',
    value: 'Plot No-781, Maharishi College Rd, in front of DN Kingsland, Saheed Nagar, Bhubaneswar, Odisha 751007',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
    onPress: () =>
      Linking.openURL(
        'https://maps.google.com/?q=Plot+No-781,+Maharishi+College+Rd,+Saheed+Nagar,+Bhubaneswar,+Odisha+751007'
      ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CancellationPolicyScreen({ navigation }: any) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
            <Text style={styles.screenLabel}>CANCELLATION POLICY</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Hero icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons name="close-circle-outline" size={moderateScale(34)} color={C.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Cancellation Policy</Text>

          {/* Info pill */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Cancel before pickup — complete after</Text>
          </View>
        </View>

        {/* ── Last Updated Note ────────────────────────────────────────── */}
        <View style={styles.updateNote}>
          <Ionicons name="time-outline" size={moderateScale(13)} color={C.textMuted} />
          <Text style={styles.updateNoteText}>Last updated: April 1, 2025</Text>
        </View>

        {/* ── Overview Banner ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
        </View>

        <View style={styles.overviewBanner}>
          <View style={styles.overviewRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: C.greenLight, marginRight: scale(12) }]}>
              <Ionicons name="checkmark-done-outline" size={moderateScale(19)} color="#065F46" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>Before Pickup</Text>
              <Text style={styles.overviewSub}>
                You may cancel a delivery request before collecting the package if necessary.
              </Text>
            </View>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2', marginRight: scale(12) }]}>
              <Ionicons name="lock-closed-outline" size={moderateScale(19)} color="#991B1B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>After Pickup</Text>
              <Text style={styles.overviewSub}>
                Once collected, you must complete the delivery unless a safety concern arises.
              </Text>
            </View>
          </View>
        </View>

        {/* ── When Cancellation Is Allowed ─────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WHEN YOU CAN CANCEL</Text>
        </View>

        <View style={styles.menuCard}>
          {WHEN_ALLOWED.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === WHEN_ALLOWED.length - 1 && styles.menuItemLast,
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

        {/* ── Consequences ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EXCESSIVE CANCELLATIONS MAY RESULT IN</Text>
        </View>

        <View style={styles.menuCard}>
          {CONSEQUENCES.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === CONSEQUENCES.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.desc}</Text>
              </View>
              <View style={styles.dangerBadge}>
                <Ionicons name="warning-outline" size={moderateScale(12)} color={C.danger} />
              </View>
            </View>
          ))}
        </View>

        {/* ── Post-Pickup Obligations ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AFTER PACKAGE PICKUP</Text>
        </View>

        <View style={styles.menuCard}>
          {POST_PICKUP.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === POST_PICKUP.length - 1 && styles.menuItemLast,
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
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={[styles.menuSub, item.icon === 'mail-outline' && styles.linkText]}>
                  {item.value}
                </Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Support Card ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEED HELP?</Text>
        </View>

        <TouchableOpacity style={styles.contactCard} activeOpacity={0.8}>
          <View style={[styles.menuIconWrap, { backgroundColor: C.primaryLight, marginRight: scale(14) }]}>
            <Ionicons name="headset-outline" size={moderateScale(19)} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Contact Support</Text>
            <Text style={styles.menuSub}>Available 24 / 7 via the Support Centre</Text>
          </View>
          <View style={styles.menuArrowWrap}>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
          </View>
        </TouchableOpacity>

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // ── Overview banner ──────────────────────────────────────────────────────
  overviewBanner: {
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
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  overviewDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: verticalScale(12),
  },
  overviewTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  overviewSub: {
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

  // ── FAQ ──────────────────────────────────────────────────────────────────
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

  // ── Contact card ─────────────────────────────────────────────────────────
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