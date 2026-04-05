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

const C = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  primary: '#1A56DB',
  primaryLight: '#EBF0FF',
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

const SECTIONS = [
  {
    id: 'intro',
    icon: 'document-text-outline',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    title: 'Overview',
    content:
      'By registering on the Zipto Rider App, delivery partners agree to operate as independent service providers. These terms govern your relationship with Zipto and outline your rights and responsibilities as a delivery partner.',
  },
  {
    id: 'eligibility',
    icon: 'person-circle-outline',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
    title: 'Eligibility',
    bullets: [
      { icon: 'calendar-outline',  text: 'Be at least 18 years of age' },
      { icon: 'card-outline',      text: 'Hold a valid driving licence' },
      { icon: 'documents-outline', text: 'Provide valid vehicle registration documents' },
    ],
  },
  {
    id: 'responsibilities',
    icon: 'shield-checkmark-outline',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    title: 'Responsibilities',
    bullets: [
      { icon: 'cube-outline',   text: 'Deliver packages safely and responsibly' },
      { icon: 'car-outline',    text: 'Follow all applicable traffic laws at all times' },
      { icon: 'people-outline', text: 'Maintain professional conduct with customers' },
    ],
  },
  {
    id: 'suspension',
    icon: 'warning-outline',
    iconBg: C.amberLight,
    iconColor: C.amberDark,
    title: 'Account Suspension',
    content:
      'Zipto reserves the right to suspend or permanently deactivate rider accounts for violations of these policies, including but not limited to misconduct, fraudulent activity, or repeated traffic offences.',
  },
  {
    id: 'privacy',
    icon: 'lock-closed-outline',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
    title: 'Privacy & Data',
    content:
      'We collect and process your personal data solely to facilitate deliveries and improve service quality. Your data will never be sold to third parties. You may request deletion of your account and associated data at any time by contacting support.',
  },
  {
    id: 'updates',
    icon: 'refresh-circle-outline',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    title: 'Policy Updates',
    content:
      'Zipto may update these terms from time to time. Continued use of the app following notification of changes constitutes acceptance of the revised terms. We will always notify you of material changes via the app or registered contact details.',
  },
];

const CONTACT_ITEMS = [
  {
    icon: 'mail-outline',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    label: 'Legal Email',
    value: 'legal@ridezipto.com',
    onPress: () => Linking.openURL('mailto:legal@ridezipto.com'),
  },
  {
    icon: 'call-outline',
    iconBg: C.greenLight,
    iconColor: C.greenDark,
    label: 'Phone',
    value: '+91 90900 29996',
    onPress: () => Linking.openURL('tel:+919090029996'),
  },
  {
    icon: 'location-outline',
    iconBg: C.amberLight,
    iconColor: C.amberDark,
    label: 'Registered Address',
    value: 'Plot No-781, Maharishi College Rd, in front of DN Kingsland, Saheed Nagar, Bhubaneswar, Odisha 751007',
    onPress: () =>
      Linking.openURL(
        'https://maps.google.com/?q=Plot+No-781+Maharishi+College+Rd+Saheed+Nagar+Bhubaneswar+Odisha+751007',
      ),
  },
];

export default function TermsScreen({ navigation }: any) {
  const [accepted, setAccepted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('intro');

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

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={moderateScale(18)} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.screenLabel}>LEGAL</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons name="document-lock-outline" size={moderateScale(34)} color={C.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Terms & Conditions</Text>
          <Text style={styles.heroSubtitle}>Zipto Rider Partner Agreement</Text>

          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: C.amber }]} />
            <Text style={styles.statusText}>Last updated · January 2025</Text>
          </View>
        </View>

        {/* ── Notice Card ───────────────────────────────────────────────── */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIconWrap}>
            <Ionicons name="information-circle-outline" size={moderateScale(20)} color={C.primary} />
          </View>
          <Text style={styles.noticeText}>
            Please read all sections carefully before accepting. By tapping "I Agree" you enter into a binding agreement with Zipto.
          </Text>
        </View>

        {/* ── Sections ──────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AGREEMENT CONTENTS</Text>
        </View>

        <View style={styles.menuCard}>
          {SECTIONS.map((section, index) => {
            const isOpen = expanded === section.id;
            const isLast = index === SECTIONS.length - 1;
            return (
              <View key={section.id} style={[styles.accordionItem, isLast && styles.menuItemLast]}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => setExpanded(isOpen ? null : section.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: section.iconBg }]}>
                    <Ionicons name={section.icon} size={moderateScale(18)} color={section.iconColor} />
                  </View>
                  <Text style={styles.accordionTitle}>{section.title}</Text>
                  <View style={styles.menuArrowWrap}>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={moderateScale(14)}
                      color={C.textMuted}
                    />
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.accordionBody}>
                    {section.content && (
                      <Text style={styles.accordionText}>{section.content}</Text>
                    )}
                    {section.bullets && section.bullets.map((bullet, bIndex) => (
                      <View key={bIndex} style={styles.bulletRow}>
                        <View style={styles.bulletIconWrap}>
                          <Ionicons name={bullet.icon} size={moderateScale(14)} color={C.primary} />
                        </View>
                        <Text style={styles.bulletText}>{bullet.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Contact Details ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HELP & COMPLIANCE</Text>
        </View>

        <View style={styles.menuCard}>
          {CONTACT_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.contactItem,
                index === CONTACT_ITEMS.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(18)} color={item.iconColor} />
              </View>
              <View style={styles.contactTextBlock}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons name="chevron-forward" size={moderateScale(14)} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: verticalScale(40) },

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
    position: 'absolute', width: scale(200), height: scale(200),
    borderRadius: scale(100), backgroundColor: 'rgba(255,255,255,0.04)',
    top: -scale(60), right: -scale(40),
  },
  decCircle2: {
    position: 'absolute', width: scale(140), height: scale(140),
    borderRadius: scale(70), backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -scale(30), left: -scale(20),
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: scale(20), marginBottom: verticalScale(24),
  },
  backButton: {
    width: moderateScale(36), height: moderateScale(36),
    borderRadius: moderateScale(18), backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  screenLabel: {
    fontSize: moderateScale(11), fontWeight: '700',
    color: 'rgba(255,255,255,0.45)', letterSpacing: 2,
  },
  heroIconRing: {
    width: moderateScale(94), height: moderateScale(94),
    borderRadius: moderateScale(47), borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center',
    alignItems: 'center', marginBottom: verticalScale(14),
  },
  heroIconBox: {
    width: moderateScale(82), height: moderateScale(82),
    borderRadius: moderateScale(41), backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: {
    fontSize: moderateScale(isSmallDevice ? 20 : 23), fontWeight: '700',
    color: C.white, marginBottom: verticalScale(4), letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: moderateScale(13), color: 'rgba(255,255,255,0.5)',
    marginBottom: verticalScale(14),
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: moderateScale(20),
    paddingHorizontal: scale(14), paddingVertical: verticalScale(5),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: scale(6),
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: moderateScale(12), color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // ── Notice card ───────────────────────────────────────────────────────────
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

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: scale(24), paddingTop: verticalScale(24), paddingBottom: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(11), fontWeight: '700', color: C.textMuted, letterSpacing: 1.4,
  },

  // ── Accordion card ────────────────────────────────────────────────────────
  menuCard: {
    backgroundColor: C.surface, marginHorizontal: scale(20),
    borderRadius: moderateScale(16), borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
    shadowRadius: 10, elevation: 3,
  },
  accordionItem: {
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: verticalScale(14), paddingHorizontal: scale(16),
    minHeight: verticalScale(60),
  },
  menuIconWrap: {
    width: moderateScale(36), height: moderateScale(36),
    borderRadius: moderateScale(10), justifyContent: 'center',
    alignItems: 'center', marginRight: scale(14),
  },
  accordionTitle: {
    flex: 1, fontSize: moderateScale(15), fontWeight: '600',
    color: C.text, letterSpacing: -0.1,
  },
  menuArrowWrap: {
    width: moderateScale(28), height: moderateScale(28),
    borderRadius: moderateScale(8), backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  accordionBody: {
    paddingHorizontal: scale(16), paddingBottom: verticalScale(16),
    paddingTop: verticalScale(2),
  },
  accordionText: {
    fontSize: moderateScale(13), color: C.textSub,
    lineHeight: moderateScale(21), fontWeight: '400',
  },

  // ── Bullets ───────────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginTop: verticalScale(10), gap: scale(10),
  },
  bulletIconWrap: {
    width: moderateScale(26), height: moderateScale(26),
    borderRadius: moderateScale(8), backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(1),
  },
  bulletText: {
    flex: 1, fontSize: moderateScale(13), color: C.textSub,
    lineHeight: moderateScale(20), fontWeight: '400',
  },

  // ── Contact items ─────────────────────────────────────────────────────────
  contactItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: verticalScale(14), paddingHorizontal: scale(16),
    borderBottomWidth: 1, borderBottomColor: C.border,
    minHeight: verticalScale(64),
  },
  contactTextBlock: {
    flex: 1, marginRight: scale(8),
  },
  contactLabel: {
    fontSize: moderateScale(12), fontWeight: '600',
    color: C.textMuted, letterSpacing: 0.2, marginBottom: verticalScale(2),
  },
  contactValue: {
    fontSize: moderateScale(13.5), fontWeight: '500',
    color: C.text, lineHeight: moderateScale(19),
  },

  // ── Checkbox ──────────────────────────────────────────────────────────────
  checkboxRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: scale(20), marginTop: verticalScale(20),
    gap: scale(12),
  },
  checkbox: {
    width: moderateScale(22), height: moderateScale(22),
    borderRadius: moderateScale(6), borderWidth: 2, borderColor: C.border,
    backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
    marginTop: verticalScale(1), flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: C.primary, borderColor: C.primary,
  },
  checkboxLabel: {
    flex: 1, fontSize: moderateScale(13), color: C.textSub,
    lineHeight: moderateScale(20), fontWeight: '500',
  },

  // ── Accept button ─────────────────────────────────────────────────────────
  acceptButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: scale(20), marginTop: verticalScale(16),
    backgroundColor: C.primary, borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16), minHeight: verticalScale(54),
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  acceptButtonDisabled: {
    backgroundColor: C.border, shadowOpacity: 0,
  },
  acceptButtonText: {
    fontSize: moderateScale(15), fontWeight: '700', color: C.white, letterSpacing: 0.1,
  },
  acceptButtonTextDisabled: { color: C.textMuted },

  // ── Decline button ────────────────────────────────────────────────────────
  declineButton: {
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: scale(20), marginTop: verticalScale(12),
    paddingVertical: verticalScale(14), borderRadius: moderateScale(14),
    borderWidth: 1, borderColor: C.border, backgroundColor: C.surface,
    minHeight: verticalScale(50),
  },
  declineText: {
    fontSize: moderateScale(14), fontWeight: '600', color: C.textSub,
  },

  // ── Version ───────────────────────────────────────────────────────────────
  versionNote: {
    textAlign: 'center', fontSize: moderateScale(11), color: C.textMuted,
    fontWeight: '400', paddingTop: verticalScale(20), paddingBottom: verticalScale(4),
  },
});