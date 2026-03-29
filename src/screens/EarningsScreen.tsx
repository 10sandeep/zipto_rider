import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function EarningsScreen({navigation}: any) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const earnings = {
    today: {total: '₹2,850', orders: 24, tips: '₹450'},
    week: {total: '₹18,500', orders: 156, tips: '₹2,200'},
    month: {total: '₹72,000', orders: 620, tips: '₹8,500'},
  };

  const current = earnings[period];
  const totalAmount = parseInt(current.total.replace(/[₹,]/g, ''));
  const canWithdraw = totalAmount >= 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
          activeOpacity={0.7}
        >
          <Text style={styles.bankLink}>Bank Details</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as const).map(p => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT AREA */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalValue}>{current.total}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{current.orders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{current.tips}</Text>
              <Text style={styles.statLabel}>Tips</Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownCard}>
          <BreakdownRow label="Base Earnings" value="₹2,100" />
          <BreakdownRow label="Distance Bonus" value="₹300" />
          <BreakdownRow label="Tips" value="₹450" />
          <BreakdownRow label="Incentives" value="₹0" last />
        </View>

        {/* Withdrawal */}
        <View style={styles.withdrawSection}>
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={moderateScale(18)} color="#3B82F6" />
            <Text style={styles.noticeText}>
              Minimum withdrawal amount is ₹100
            </Text>
          </View>

          <TouchableOpacity
            disabled={!canWithdraw}
            style={[
              styles.withdrawButton,
              !canWithdraw && styles.withdrawDisabled,
            ]}
            activeOpacity={0.8}>
            <Text style={styles.withdrawText}>
              {canWithdraw ? 'Withdraw Earnings' : 'Insufficient Balance'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const BreakdownRow = ({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View style={[styles.row, !last && styles.rowBorder]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
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
  headerLeft: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  headerTitle: {
    fontSize: moderateScale(22), 
    fontWeight: '800',
    fontFamily: 'Poppins-Regular', 
    color: '#1C1C1E'
  },
  bankLink: {
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6'
  },

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
    justifyContent: 'center',
    minHeight: verticalScale(36),
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  periodText: {
    fontSize: moderateScale(13), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#64748B'
  },
  periodTextActive: {
    color: '#FFF'
  },

  content: {
    flexGrow: 1,
    padding: scale(16),
    paddingBottom: verticalScale(100),
    gap: verticalScale(16),
  },

  totalCard: {
    backgroundColor: '#3B82F6',
    padding: scale(18),
    borderRadius: moderateScale(18),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalLabel: {
    fontSize: moderateScale(14), 
    color: '#E0E7FF',
    marginBottom: verticalScale(4),
  },
  totalValue: {
    fontSize: moderateScale(isSmallDevice ? 32 : 36), 
    fontWeight: '800',
    fontFamily: 'Poppins-Regular', 
    color: '#FFF',
    marginBottom: verticalScale(12),
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
    padding: scale(12),
  },
  statItem: {
    flex: 1, 
    alignItems: 'center'
  },
  statDivider: {
    width: 1, 
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  statValue: {
    fontSize: moderateScale(18), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular', 
    color: '#FFF',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12), 
    color: '#E0E7FF'
  },

  breakdownCard: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    padding: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: verticalScale(8),
    minHeight: verticalScale(36),
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9'
  },
  rowLabel: {
    fontSize: moderateScale(14), 
    color: '#64748B',
    flex: 1,
  },
  rowValue: {
    fontSize: moderateScale(14), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E'
  },

  withdrawSection: {
    marginTop: 'auto',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: scale(10),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(10),
    gap: scale(6),
    minHeight: verticalScale(44),
  },
  noticeText: {
    fontSize: moderateScale(13), 
    color: '#3B82F6', 
    fontFamily: 'Poppins-Regular',
    flex: 1,
    lineHeight: moderateScale(18),
  },
  withdrawButton: {
    backgroundColor: '#50C878',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(50),
    shadowColor: '#50C878',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  withdrawDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  withdrawText: {
    color: '#FFF', 
    fontSize: moderateScale(15), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
});