import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (identical across all screens) ───────────────────────────────────
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
  dangerLight: '#FEE2E2',
  white: '#FFFFFF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  yellow: '#FEF3C7',
  yellowText: '#92400E',
  purple: '#EDE9FE',
  purpleText: '#5B21B6',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FaqItem = {
  question: string;
  answer: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

type Category = {
  key: string;
  label: string;
  tabIcon: string;
  faqs: FaqItem[];
};

type ContactItem = {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  isLink?: boolean;
  onPress?: () => void;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    key: 'earnings',
    label: 'Earnings',
    tabIcon: 'wallet-outline',
    faqs: [
      {
        question: 'How are my earnings calculated?',
        answer:
          'Your earnings are based on distance, delivery type, and demand. You can see estimated earnings before accepting each order.',
        icon: 'calculator-outline',
        iconBg: C.primaryLight,
        iconColor: C.primary,
      },
      {
        question: 'When do I receive my payments?',
        answer:
          'Payments are settled daily/weekly as per the system. You can check your earnings and payment history in the app.',
        icon: 'calendar-outline',
        iconBg: C.greenLight,
        iconColor: '#065F46',
      },
      {
        question: 'How can I withdraw my earnings?',
        answer:
          'You can withdraw your earnings directly to your bank account from the wallet section in the app.',
        icon: 'arrow-up-circle-outline',
        iconBg: C.greenLight,
        iconColor: '#065F46',
      },
      {
        question: 'Why is my payment delayed?',
        answer:
          'Payment delays may occur due to bank processing time or verification issues. If it takes longer than expected, please contact support.',
        icon: 'time-outline',
        iconBg: C.dangerLight,
        iconColor: '#991B1B',
      },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    tabIcon: 'cube-outline',
    faqs: [
      {
        question: 'How do I receive delivery orders?',
        answer:
          'Once you are online, you will receive nearby delivery requests. You can accept or reject orders based on your availability.',
        icon: 'phone-portrait-outline',
        iconBg: C.primaryLight,
        iconColor: C.primary,
      },
      {
        question: 'Can I reject an order?',
        answer:
          'Yes, you can reject orders. However, frequent rejections may affect your account performance score.',
        icon: 'close-circle-outline',
        iconBg: C.yellow,
        iconColor: C.yellowText,
      },
      {
        question: 'What should I do after accepting an order?',
        answer:
          'Go to the pickup location, collect the item, and deliver it to the destination. Use the app to navigate and update status at each step.',
        icon: 'checkmark-circle-outline',
        iconBg: C.greenLight,
        iconColor: '#065F46',
      },
      {
        question: "What if I can't reach the customer?",
        answer:
          'Try calling the customer through the app. If still unreachable, contact support for further instructions before taking any action.',
        icon: 'call-outline',
        iconBg: C.yellow,
        iconColor: C.yellowText,
      },
      {
        question: 'What if the customer cancels the order?',
        answer:
          'If the order is canceled before pickup, no action is needed. If canceled after pickup, follow app instructions or contact support immediately.',
        icon: 'ban-outline',
        iconBg: C.dangerLight,
        iconColor: '#991B1B',
      },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    tabIcon: 'document-text-outline',
    faqs: [
      {
        question: 'How do I upload or update my documents?',
        answer:
          'Go to the Profile or Documents section in the app and upload the required documents. Ensure they are clear and legible.',
        icon: 'cloud-upload-outline',
        iconBg: C.primaryLight,
        iconColor: C.primary,
      },
      {
        question: 'Why is my document still pending?',
        answer:
          'Verification may take some time. Ensure your documents are clear and valid. If the delay is unusually long, contact support.',
        icon: 'hourglass-outline',
        iconBg: C.yellow,
        iconColor: C.yellowText,
      },
      {
        question: 'What documents are required?',
        answer:
          'You need: Driving License, RC Book, Insurance certificate, and Vehicle details. All documents must be valid and current.',
        icon: 'clipboard-outline',
        iconBg: C.greenLight,
        iconColor: '#065F46',
      },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    tabIcon: 'person-outline',
    faqs: [
      {
        question: 'Why is my account inactive?',
        answer:
          'Your account may be inactive due to incomplete documents, low performance, or policy violations. Contact support for specific details.',
        icon: 'pause-circle-outline',
        iconBg: C.dangerLight,
        iconColor: '#991B1B',
      },
      {
        question: 'How do I go online or offline?',
        answer:
          'You can toggle your availability from the home screen of the app to start or stop receiving delivery orders.',
        icon: 'power-outline',
        iconBg: C.greenLight,
        iconColor: '#065F46',
      },
      {
        question: 'Can I use multiple vehicles?',
        answer:
          'Yes, but you must register and verify each vehicle separately. Each vehicle requires its own set of valid documents.',
        icon: 'car-outline',
        iconBg: C.primaryLight,
        iconColor: C.primary,
      },
    ],
  },
  {
    key: 'issues',
    label: 'Issues',
    tabIcon: 'alert-circle-outline',
    faqs: [
      {
        question: 'How do I report an issue?',
        answer:
          'You can report issues via WhatsApp, Call Support, or Email. For faster resolution, include order details or screenshots.',
        icon: 'flag-outline',
        iconBg: C.primaryLight,
        iconColor: C.primary,
      },
      {
        question: 'What if I face a problem during delivery?',
        answer:
          'If you face any issue — wrong address, customer dispute, vehicle trouble — contact support immediately for guidance before acting on your own.',
        icon: 'build-outline',
        iconBg: C.yellow,
        iconColor: C.yellowText,
      },
      {
        question: 'What happens if I cancel frequently?',
        answer:
          'Frequent cancellations negatively impact your performance score and may lead to reduced order assignments or a temporary account suspension.',
        icon: 'trending-down-outline',
        iconBg: C.dangerLight,
        iconColor: '#991B1B',
      },
    ],
  },
  {
    key: 'safety',
    label: 'Safety',
    tabIcon: 'shield-outline',
    faqs: [
      {
        question: 'What items should I not deliver?',
        answer:
          'Do not accept illegal, hazardous, or prohibited items such as drugs, weapons, or unsafe materials. If you suspect an order contains such items, refuse and report immediately.',
        icon: 'warning-outline',
        iconBg: C.dangerLight,
        iconColor: '#991B1B',
      },
      {
        question: 'What if an item is damaged?',
        answer:
          'Ensure proper handling during every delivery. If damage occurs, report it immediately via the app or by contacting support. Document with photos where possible.',
        icon: 'cube-outline',
        iconBg: C.yellow,
        iconColor: C.yellowText,
      },
    ],
  },
];

const CONTACT_DETAILS: ContactItem[] = [
  {
    icon: 'mail-outline',
    label: 'Email Us',
    value: 'rider.support@ridezipto.com',
    iconBg: C.primaryLight,
    iconColor: C.primary,
    isLink: true,
    onPress: () => Linking.openURL('mailto:rider.support@ridezipto.com'),
  },
  {
    icon: 'call-outline',
    label: 'Call Us',
    value: '+91 90900 29996',
    iconBg: C.greenLight,
    iconColor: '#065F46',
    onPress: () => Linking.openURL('tel:+919090029996'),
  },
  {
    icon: 'location-outline',
    label: 'Our Address',
    value: 'Saheed Nagar, Bhubaneswar, Odisha 751007',
    iconBg: C.purple,
    iconColor: C.purpleText,
    onPress: () =>
      Linking.openURL(
        'https://maps.google.com/?q=Plot+No-781,+Maharishi+College+Rd,+Saheed+Nagar,+Bhubaneswar,+Odisha+751007'
      ),
  },
];

// ─── FaqRow Sub-component ─────────────────────────────────────────────────────

type FaqRowProps = {
  item: FaqItem;
  isLast: boolean;
};

const FaqRow: React.FC<FaqRowProps> = ({ item, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.faqItem, isLast && styles.itemLast]}
      onPress={() => setExpanded(prev => !prev)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
      </View>
      <View style={styles.faqTextBlock}>
        <Text style={styles.itemLabel}>{item.question}</Text>
        {expanded && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </View>
      <View style={styles.arrowWrap}>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={moderateScale(16)}
          color={C.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Props = {
  navigation: any;
};

export default function FAQScreen({ navigation }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('earnings');

  const activeCat = CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ────────────────────────────────────────────── */}
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
              {/* Replace the require path with your actual asset path */}
              <Image
                source={require('../assets/back.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.screenLabel}>RIDER FAQ</Text>
            <View style={{ width: moderateScale(36) }} />
          </View>

          {/* Hero icon */}
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons
                name="help-circle-outline"
                size={moderateScale(34)}
                color={C.white}
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>Help & FAQ</Text>

          {/* Info pill */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Answers to common rider questions</Text>
          </View>
        </View>

        {/* ── Last Updated Note ──────────────────────────────────────── */}
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
        {/* ── Category Tab Strip ─────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStrip}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.tabIcon}
                  size={moderateScale(13)}
                  color={isActive ? C.white : C.textSub}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Active Category FAQs ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeCat.label.toUpperCase()}</Text>
        </View>

        <View style={styles.menuCard}>
          {activeCat.faqs.map((faq, index) => (
            <FaqRow
              key={index}
              item={faq}
              isLast={index === activeCat.faqs.length - 1}
            />
          ))}
        </View>

        {/* ── Help & Compliance ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HELP & COMPLIANCE</Text>
        </View>

        <View style={styles.menuCard}>
          {CONTACT_DETAILS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === CONTACT_DETAILS.length - 1 && styles.itemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={moderateScale(19)} color={item.iconColor} />
              </View>
              <View style={styles.labelBlock}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={[styles.itemSub, item.isLink && styles.itemSubLink]}>
                  {item.value}
                </Text>
              </View>
              <View style={styles.arrowWrap}>
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Need Help? Card ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEED HELP?</Text>
        </View>

        <TouchableOpacity style={styles.contactCard} activeOpacity={0.8}>
          <View style={[styles.iconWrap, { backgroundColor: C.primaryLight, marginRight: scale(14) }]}>
            <Ionicons name="headset-outline" size={moderateScale(19)} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>Contact Support</Text>
            <Text style={styles.itemSub}>Available 24 / 7 via the Support Centre</Text>
          </View>
          <View style={styles.arrowWrap}>
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
  backIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: C.white,
  },
  screenLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
  },

  // ── Hero icon ─────────────────────────────────────────────────────────────
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

  // ── Update note ───────────────────────────────────────────────────────────
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

  // ── Tab strip ─────────────────────────────────────────────────────────────
  tabStrip: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(4),
    gap: scale(8),
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(13),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  tabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  tabLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: C.textSub,
  },
  tabLabelActive: {
    color: C.white,
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

  // ── Menu item ─────────────────────────────────────────────────────────────
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: verticalScale(64),
  },
  itemLast: {
    borderBottomWidth: 0,
  },

  // ── FAQ item ──────────────────────────────────────────────────────────────
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

  // ── Shared row elements ───────────────────────────────────────────────────
  iconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
    flexShrink: 0,
  },
  labelBlock: {
    flex: 1,
    marginRight: scale(8),
  },
  itemLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  itemSub: {
    fontSize: moderateScale(12),
    color: C.textMuted,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(17),
  },
  itemSubLink: {
    color: C.primary,
  },
  arrowWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // ── Contact card ──────────────────────────────────────────────────────────
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