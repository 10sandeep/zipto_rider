import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Linking, Dimensions, Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (identical to SupportScreen) ────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const DATA_COLLECTED = [
  {
    icon: 'person-outline',
    label: 'Name',
    desc: 'Your full legal name for account identification.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'call-outline',
    label: 'Phone Number',
    desc: 'Used for account verification and delivery communication.',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'home-outline',
    label: 'Address',
    desc: 'Your home or operational base address for logistics planning.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    icon: 'car-outline',
    label: 'Vehicle Details',
    desc: 'Make, model, registration, and insurance of your delivery vehicle.',
    iconBg: '#EDE9FE',
    iconColor: '#5B21B6',
  },
  {
    icon: 'card-outline',
    label: 'Driving License',
    desc: 'License number and validity to verify eligibility as a rider.',
    iconBg: '#FEE2E2',
    iconColor: '#991B1B',
  },
  {
    icon: 'location-outline',
    label: 'Real-Time Location',
    desc: 'GPS data collected during active delivery sessions only.',
    iconBg: '#DCFCE7',
    iconColor: '#166534',
  },
];

const DATA_USAGE = [
  {
    icon: 'bicycle-outline',
    label: 'Assign Deliveries',
    desc: 'Match you with nearby delivery requests efficiently.',
    iconBg: C.primaryLight,
    iconColor: C.primary,
  },
  {
    icon: 'navigate-outline',
    label: 'Track Progress',
    desc: 'Enable real-time delivery tracking for customers and merchants.',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'shield-checkmark-outline',
    label: 'Safety & Efficiency',
    desc: 'Analyse patterns to improve platform safety and operations.',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
];

const CONTACT_INFO = [
  {
    icon: 'mail-outline',
    label: 'Email Us',
    value: 'legal@ridezipto.com',
    action: () => Linking.openURL('mailto:legal@ridezipto.com'),
    iconBg: '#EBF0FF',
    iconColor: '#1A56DB',
  },
  {
    icon: 'call-outline',
    label: 'Call Us',
    value: '+91 9090029996',
    action: () => Linking.openURL('tel:+919090029996'),
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
  },
  {
    icon: 'location-outline',
    label: 'Visit Us',
    value: 'Bhubaneswar, Odisha 751007',
    action: () => Linking.openURL('https://maps.google.com/?q=Plot+No-781+Maharishi+College+Rd+Saheed+Nagar+Bhubaneswar+Odisha+751007'),
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
];

const FAQS = [
  {
    question: 'Is my data shared with third parties?',
    answer:
      'Zipto will never sell your personal data to third parties. Data is only shared with delivery partners strictly necessary to complete your assignments.',
  },
  {
    question: 'How long is my data retained?',
    answer:
      'We retain your data for as long as your account is active. Upon account closure, personal data is deleted within 30 days, except where required by law.',
  },
  {
    question: 'Can I request my data to be deleted?',
    answer:
      'Yes. Contact our privacy team at rider.support@ridezipto.com and we will process your deletion request within 7 business days.',
  },
  {
    question: 'Is my location tracked at all times?',
    answer:
      'No. Location data is collected only during active delivery sessions. Background tracking stops as soon as you go offline.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen({ navigation }: any) {
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
            <Text style={styles.screenLabel}>PRIVACY POLICY</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Hero icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons name="shield-checkmark-outline" size={moderateScale(34)} color={C.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Your Privacy Matters</Text>

          {/* Trust pill */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>We will never sell your personal data</Text>
          </View>
        </View>

        {/* ── Last Updated Note ────────────────────────────────────────── */}
        <View style={styles.updateNote}>
          <Ionicons name="time-outline" size={moderateScale(13)} color={C.textMuted} />
          <Text style={styles.updateNoteText}>Last updated: April 1, 2025</Text>
        </View>
 <View style={styles.noticeCard}>
          <View style={styles.noticeIconWrap}>
            <Ionicons name="information-circle-outline" size={moderateScale(20)} color={C.primary} />
          </View>
          <Text style={styles.noticeText}>
            Welcome to zipto, Zipto is operated by (Zipto Hyperlogistics Pvt. Ltd).Please read all sections carefully before accepting. By tapping "I Agree" you enter into a binding agreement with Zipto.
          </Text>
        </View>
        {/* ── Data Collected ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>INFORMATION WE COLLECT</Text>
        </View>

        <View style={styles.menuCard}>
          {DATA_COLLECTED.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === DATA_COLLECTED.length - 1 && styles.menuItemLast,
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

        {/* ── How We Use It ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HOW WE USE YOUR INFORMATION</Text>
        </View>

        <View style={styles.menuCard}>
          {DATA_USAGE.map((item, index) => (
            <View
              key={index}
              style={[
                styles.menuItem,
                index === DATA_USAGE.length - 1 && styles.menuItemLast,
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

        {/* ── FAQ Section ──────────────────────────────────────────────── */}
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

        {/* ── Contact Information ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HELP & COMPLIANCE</Text>
        </View>

        <View style={styles.menuCard}>
          {CONTACT_INFO.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.contactItem,
                index === CONTACT_INFO.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={contact.action}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: contact.iconBg }]}>
                <Ionicons name={contact.icon} size={moderateScale(19)} color={contact.iconColor} />
              </View>
              <View style={styles.contactTextBlock}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Privacy Team Card ────────────────────────────────────────── */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRIVACY CONCERNS?</Text>
        </View> */}

        {/* <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.8}
          onPress={() => Linking.openURL('mailto:privacy@ridezipto.com')}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7', marginRight: scale(14) }]}>
            <Ionicons name="mail-outline" size={moderateScale(19)} color="#92400E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Contact Privacy Team</Text>
            <Text style={styles.menuSub}>privacy@ridezipto.com</Text>
          </View>
          <View style={styles.menuArrowWrap}>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
          </View>
        </TouchableOpacity> */}

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles (mirrors SupportScreen exactly) ───────────────────────────────────

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
    noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: scale(20), marginTop: verticalScale(16),
    backgroundColor: C.primaryLight, borderRadius: moderateScale(12),
    borderWidth: 1, borderColor: '#BFCFFF',
    padding: scale(14), gap: scale(10),
  },
    noticeIconWrap: { marginTop: verticalScale(1) },
  noticeText: {
    flex: 1, fontSize: moderateScale(13), color: '#1E3A8A',
    lineHeight: moderateScale(19), fontWeight: '500',
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
  menuArrowWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
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

  // ── Contact specific ─────────────────────────────────────────────────────
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: verticalScale(70),
  },
  contactTextBlock: {
    flex: 1,
    marginRight: scale(8),
    paddingTop: verticalScale(2),
  },
  contactLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
    marginBottom: verticalScale(4),
  },
  contactValue: {
    fontSize: moderateScale(13),
    color: C.textSub,
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