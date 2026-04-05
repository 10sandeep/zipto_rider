import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (matches Zipto theme) ───────────────────────────────────────────
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
};

export default function SettingsScreen({navigation}: any) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

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
            <Text style={styles.screenLabel}>SETTINGS</Text>
            <View style={{width: moderateScale(36)}} />
          </View>

          <View style={styles.heroIconRing}>
            <View style={styles.heroIconBox}>
              <Ionicons
                name="settings-outline"
                size={moderateScale(34)}
                color={C.white}
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>Settings</Text>

          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Manage your preferences</Text>
          </View>
        </View>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        </View>

        <View style={styles.menuCard}>
          <View style={styles.toggleItem}>
            <View style={[styles.menuIconWrap, {backgroundColor: C.primaryLight}]}>
              <Ionicons
                name="notifications-outline"
                size={moderateScale(19)}
                color={C.primary}
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Push Notifications</Text>
              <Text style={styles.menuSub}>
                Receive alerts for new deliveries and updates.
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{false: C.border, true: C.primary}}
              thumbColor={C.white}
              style={{
                transform: [
                  {scaleX: Platform.OS === 'ios' ? 0.85 : 1},
                  {scaleY: Platform.OS === 'ios' ? 0.85 : 1},
                ],
              }}
            />
          </View>

          <View style={[styles.toggleItem, styles.menuItemLast]}>
            <View style={[styles.menuIconWrap, {backgroundColor: C.amberLight}]}>
              <Ionicons
                name="alert-circle-outline"
                size={moderateScale(19)}
                color={C.amberDark}
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Order Alerts</Text>
              <Text style={styles.menuSub}>
                Get notified when a new order is assigned to you.
              </Text>
            </View>
            <Switch
              value={orderAlerts}
              onValueChange={setOrderAlerts}
              trackColor={{false: C.border, true: C.primary}}
              thumbColor={C.white}
              style={{
                transform: [
                  {scaleX: Platform.OS === 'ios' ? 0.85 : 1},
                  {scaleY: Platform.OS === 'ios' ? 0.85 : 1},
                ],
              }}
            />
          </View>
        </View>

        {/* ── Privacy ──────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
        </View>

        <View style={styles.menuCard}>
          <View style={[styles.toggleItem, styles.menuItemLast]}>
            <View style={[styles.menuIconWrap, {backgroundColor: C.greenLight}]}>
              <Ionicons
                name="location-outline"
                size={moderateScale(19)}
                color={C.greenDark}
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Location Sharing</Text>
              <Text style={styles.menuSub}>
                Share your live location during active deliveries only.
              </Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{false: C.border, true: C.primary}}
              thumbColor={C.white}
              style={{
                transform: [
                  {scaleX: Platform.OS === 'ios' ? 0.85 : 1},
                  {scaleY: Platform.OS === 'ios' ? 0.85 : 1},
                ],
              }}
            />
          </View>
        </View>

        {/* ── App ──────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APP</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, {backgroundColor: '#EDE9FE'}]}>
              <Ionicons
                name="language-outline"
                size={moderateScale(19)}
                color="#5B21B6"
              />
            </View>
            <View style={styles.menuLabelBlock}>
              <Text style={styles.menuLabel}>Language</Text>
              <Text style={styles.menuSub}>English</Text>
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

  // Toggle row (with Switch)
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: verticalScale(68),
  },

  // Regular tappable row
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
  menuArrowWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: C.bg,
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