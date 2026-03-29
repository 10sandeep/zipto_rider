import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getEarningsDashboard,
  requestWithdrawal,
  getBankAccounts,
  EarningsDashboard,
  BankAccount,
} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (s: number) => (SCREEN_WIDTH / 375) * s;
const verticalScale = (s: number) => (SCREEN_HEIGHT / 812) * s;
const moderateScale = (s: number, f = 0.5) => s + (scale(s) - s) * f;
const isSmallDevice = SCREEN_WIDTH < 375;

const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2});

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen({navigation}: any) {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<EarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [primaryAccount, setPrimaryAccount] = useState<BankAccount | null>(null);

  const fetchData = useCallback(
    async (p: Period = period, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [dashboard, accounts] = await Promise.all([
          getEarningsDashboard(p),
          getBankAccounts(),
        ]);
        setData(dashboard);
        setPrimaryAccount(accounts.find(a => a.is_primary) ?? accounts[0] ?? null);
      } catch {
        Alert.alert('Error', 'Could not load earnings data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period],
  );

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(period, true);
  };

  const handleWithdraw = () => {
    if (!data || walletBalance < 100) {return;}

    Alert.alert(
      'Withdraw Earnings',
      primaryAccount
        ? `Withdraw to ${primaryAccount.bank_name} (••••${primaryAccount.account_number.slice(-4)})?`
        : 'No primary bank account found. Add one to withdraw.',
      primaryAccount
        ? [
            {text: 'Cancel', style: 'cancel'},
            {
              text: `Withdraw ${fmt(walletBalance)}`,
              onPress: () => doWithdraw(),
            },
          ]
        : [{text: 'Add Bank Account', onPress: () => navigation.navigate('BankDetails')}],
    );
  };

  const doWithdraw = async () => {
    if (!data) {return;}
    setWithdrawing(true);
    try {
      const res = await requestWithdrawal(
        data.wallet_balance,
        primaryAccount?.id,
      );
      Alert.alert(
        'Request Submitted',
        `${fmt(res.amount)} withdrawal requested.\nRemaining balance: ${fmt(res.remaining_balance)}`,
      );
      fetchData(period, true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Withdrawal failed. Try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  // Parse as float — backend may return wallet_balance as a string from DB
  const walletBalance = parseFloat(String(data?.wallet_balance ?? 0)) || 0;
  const canWithdraw = walletBalance >= 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('BankDetails')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Text style={styles.bankLink}>Bank Details</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }>

          {/* Withdrawable Wallet Balance — shown FIRST */}
          <View style={styles.walletCard}>
            <View style={styles.walletTop}>
              <View style={styles.walletLeft}>
                <Ionicons name="wallet" size={moderateScale(26)} color="#7C3AED" />
                <View style={{marginLeft: scale(10)}}>
                  <Text style={styles.walletLabel}>Withdrawable Balance</Text>
                  <Text style={styles.walletValue}>{fmt(walletBalance)}</Text>
                </View>
              </View>
              <View style={[styles.walletBadge, canWithdraw ? styles.walletBadgeReady : styles.walletBadgeLow]}>
                <Text style={[styles.walletBadgeText, canWithdraw ? styles.walletBadgeTextReady : styles.walletBadgeTextLow]}>
                  {canWithdraw ? 'Ready to Withdraw' : `Min ₹100 needed`}
                </Text>
              </View>
            </View>
            {!canWithdraw && walletBalance > 0 && (
              <View style={styles.walletProgressBg}>
                <View style={[styles.walletProgressFill, {width: `${Math.min(100, (walletBalance / 100) * 100)}%` as any}]} />
              </View>
            )}
          </View>

          {/* Total Earnings Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>
              {period === 'today' ? "Today's Earnings" : period === 'week' ? "This Week's Earnings" : "This Month's Earnings"}
            </Text>
            <Text style={styles.totalValue}>{fmt(data?.total_earnings ?? 0)}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data?.trip_count ?? 0}</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fmt(data?.breakdown.gross_fare ?? 0)}</Text>
                <Text style={styles.statLabel}>Gross Fare</Text>
              </View>
            </View>
          </View>

          {/* Breakdown Card */}
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Fare Breakdown</Text>
            <BreakdownRow
              label="Base Fare"
              value={fmt(data?.breakdown.base_fare ?? 0)}
              icon="home-outline"
              color="#3B82F6"
            />
            <BreakdownRow
              label="Distance Charge"
              value={fmt(data?.breakdown.distance_charge ?? 0)}
              icon="navigate-outline"
              color="#10B981"
            />
            <BreakdownRow
              label="Other Charges"
              value={fmt(data?.breakdown.other_charges ?? 0)}
              icon="add-circle-outline"
              color="#F59E0B"
            />
            <BreakdownRow
              label="Platform Fee"
              value={`- ${fmt(data?.breakdown.platform_fee ?? 0)}`}
              icon="remove-circle-outline"
              color="#EF4444"
              isDeduction
              last
            />
          </View>

          {/* Withdraw Section */}
          <View style={styles.withdrawSection}>

            {primaryAccount ? (
              <View style={styles.bankInfo}>
                <Ionicons name="card-outline" size={moderateScale(18)} color="#6B7280" />
                <Text style={styles.bankInfoText}>
                  {primaryAccount.bank_name} ••••{primaryAccount.account_number.slice(-4)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBankBtn}
                onPress={() => navigation.navigate('BankDetails')}
                activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={moderateScale(16)} color="#3B82F6" />
                <Text style={styles.addBankText}>Add bank account to withdraw</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              disabled={!canWithdraw || withdrawing}
              style={[
                styles.withdrawButton,
                (!canWithdraw || withdrawing) && styles.withdrawDisabled,
              ]}
              onPress={handleWithdraw}
              activeOpacity={0.8}>
              {withdrawing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.withdrawText}>
                  {canWithdraw
                    ? `Withdraw ${fmt(walletBalance)}`
                    : `Need ₹${(100 - walletBalance).toFixed(0)} more to withdraw`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function BreakdownRow({
  label, value, icon, color, isDeduction = false, last = false,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  isDeduction?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconBg, {backgroundColor: color + '18'}]}>
          <Ionicons name={icon} size={moderateScale(15)} color={color} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, isDeduction && styles.rowValueDeduction]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(45) : verticalScale(35),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center'},
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  headerTitle: {fontSize: moderateScale(22), fontWeight: '800', color: '#1C1C1E'},
  bankLink: {fontSize: moderateScale(14), fontWeight: '600', color: '#3B82F6'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    gap: scale(8),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  periodButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(18),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  periodText: {fontSize: moderateScale(13), fontWeight: '600', color: '#64748B'},
  periodTextActive: {color: '#FFF'},

  content: {padding: scale(16), paddingBottom: verticalScale(100), gap: verticalScale(14)},

  // Total earnings card
  totalCard: {
    backgroundColor: '#3B82F6',
    padding: scale(18),
    borderRadius: moderateScale(18),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalLabel: {fontSize: moderateScale(13), color: '#E0E7FF', marginBottom: verticalScale(4)},
  totalValue: {
    fontSize: moderateScale(isSmallDevice ? 32 : 36),
    fontWeight: '800',
    color: '#FFF',
    marginBottom: verticalScale(12),
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
    padding: scale(12),
  },
  statItem: {flex: 1, alignItems: 'center'},
  statDivider: {width: 1, backgroundColor: 'rgba(255,255,255,0.3)'},
  statValue: {fontSize: moderateScale(16), fontWeight: '700', color: '#FFF', marginBottom: 2},
  statLabel: {fontSize: moderateScale(11), color: '#E0E7FF'},

  // Wallet card
  walletCard: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(14),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  walletTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  walletLeft: {flexDirection: 'row', alignItems: 'center'},
  walletLabel: {fontSize: moderateScale(12), color: '#6B7280', marginBottom: 2},
  walletValue: {fontSize: moderateScale(24), fontWeight: '800', color: '#7C3AED'},
  walletBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  walletBadgeReady: {backgroundColor: '#DCFCE7'},
  walletBadgeLow: {backgroundColor: '#FEF3C7'},
  walletBadgeText: {fontSize: moderateScale(11), fontWeight: '700'},
  walletBadgeTextReady: {color: '#16A34A'},
  walletBadgeTextLow: {color: '#D97706'},
  walletProgressBg: {
    height: 4,
    backgroundColor: '#F3E8FF',
    borderRadius: 2,
    marginTop: verticalScale(10),
    overflow: 'hidden',
  },
  walletProgressFill: {
    height: 4,
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },

  // Breakdown
  breakdownCard: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(14),
    padding: scale(14),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  rowBorder: {borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  rowLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  rowIconBg: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  rowLabel: {fontSize: moderateScale(13), color: '#374151', flex: 1},
  rowValue: {fontSize: moderateScale(14), fontWeight: '700', color: '#1C1C1E'},
  rowValueDeduction: {color: '#EF4444'},

  // Withdraw
  withdrawSection: {gap: verticalScale(10)},
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: scale(12),
    borderRadius: moderateScale(10),
    gap: scale(8),
  },
  noticeText: {fontSize: moderateScale(13), color: '#1D4ED8', flex: 1, lineHeight: moderateScale(18)},
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(10),
    padding: scale(12),
    gap: scale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bankInfoText: {fontSize: moderateScale(13), color: '#374151', fontWeight: '500'},
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(10),
    padding: scale(12),
    gap: scale(8),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  addBankText: {fontSize: moderateScale(13), color: '#3B82F6', fontWeight: '600'},
  withdrawButton: {
    backgroundColor: '#50C878',
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#50C878',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  withdrawDisabled: {backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0},
  withdrawText: {color: '#FFF', fontSize: moderateScale(15), fontWeight: '700'},
});
