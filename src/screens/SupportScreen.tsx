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

// ─── Palette (identical to ProfileScreen) ────────────────────────────────────
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

const CONTACT_ITEMS = [
  {
    icon: 'call-outline',
    label: 'Call Support',
    value: '+91 90900 29996',
    iconBg: '#EBF0FF',
    iconColor: C.primary,
    onPress: () => Linking.openURL('tel:+919090029996'),
  },
  {
    icon: 'logo-whatsapp',
    label: 'WhatsApp',
    value: '+91 90900 29996',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
    onPress: () => Linking.openURL('https://wa.me/919090029996'),
  },
  {
    icon: 'mail-outline',
    label: 'Email',
    value: 'rider.support@ridezipto.com',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
    onPress: () => Linking.openURL('mailto:rider.support@ridezipto.com'),
  },
];

const FAQS = [
  {
    question: 'How do I update my documents?',
    answer: 'Go to Profile → Vehicle Details and upload new documents.',
  },
  {
    question: 'When do I receive payments?',
    answer: 'You will receive the payment on the same day, provided your minimum balance is ₹199 or more.',
  },
  {
    question: 'How to report an issue?',
    answer: 'Use the contact options above to reach our support team.',
  },
];

export default function SupportScreen({ navigation }: any) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

          {/* Top bar with back button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={moderateScale(18)} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.screenLabel}>SUPPORT</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Hero icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons name="headset-outline" size={moderateScale(34)} color={C.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>We're here to help</Text>

          {/* Status pill */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Usually responds within minutes.</Text>
          </View>
        </View>

        {/* ── Contact Section ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONTACT US</Text>
        </View>

        <View style={styles.menuCard}>
          {CONTACT_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === CONTACT_ITEMS.length - 1 && styles.menuItemLast]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.menuLabelBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub} numberOfLines={1}>{item.value}</Text>
              </View>
              <View style={styles.menuArrowWrap}>
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── FAQ Section ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED</Text>
        </View>

        <View style={styles.menuCard}>
          {FAQS.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.faqItem, index === FAQS.length - 1 && styles.menuItemLast]}
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

        <Text style={styles.versionNote}>Driver Partner App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

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

  // ── Shared section header ─────────────────────────────────────────────────
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

  // ── Menu card (shared pattern) ────────────────────────────────────────────
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
  },
  menuArrowWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── FAQ specific ──────────────────────────────────────────────────────────
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