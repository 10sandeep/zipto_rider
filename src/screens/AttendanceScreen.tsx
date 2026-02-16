import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

const attendanceData = [
  { date: 'Jan 27', day: 'Today', status: 'present', hours: '8.5', earnings: '₹2,850' },
  { date: 'Jan 26', day: 'Mon', status: 'present', hours: '9.0', earnings: '₹3,100' },
  { date: 'Jan 25', day: 'Sun', status: 'absent', hours: '0', earnings: '₹0' },
  { date: 'Jan 24', day: 'Sat', status: 'present', hours: '7.5', earnings: '₹2,500' },
  { date: 'Jan 23', day: 'Fri', status: 'present', hours: '8.0', earnings: '₹2,800' },
  { date: 'Jan 22', day: 'Thu', status: 'halfday', hours: '4.0', earnings: '₹1,400' },
  { date: 'Jan 21', day: 'Wed', status: 'present', hours: '9.5', earnings: '₹3,300' },
];

export default function AttendanceScreen({ navigation }: any) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const presentDays = attendanceData.filter(d => d.status === 'present').length;
  const totalHours = attendanceData.reduce((sum, d) => sum + parseFloat(d.hours), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>This Month</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{presentDays}</Text>
              <Text style={styles.summaryLabel}>Days Present</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Total Hours</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceList}>
          <Text style={styles.sectionTitle}>Daily Attendance</Text>
          {attendanceData.map((item, index) => (
            <View key={index} style={styles.attendanceCard}>
              <View style={styles.dateSection}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Text style={styles.dayText}>{item.day}</Text>
              </View>
              <View style={styles.statusSection}>
                <View style={[
                  styles.statusIndicator,
                  item.status === 'present' && styles.statusPresent,
                  item.status === 'absent' && styles.statusAbsent,
                  item.status === 'halfday' && styles.statusHalfday,
                ]} />
                <View style={styles.statusInfo}>
                  <Text style={styles.hoursText}>{item.hours} hrs</Text>
                  <Text style={styles.earningsText}>{item.earnings}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#50C878' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Half Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40), 
    paddingBottom: verticalScale(16), 
    backgroundColor: '#FFFFFF' 
  },
  headerTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    color: '#1C1C1E' 
  },
  periodSelector: { 
    flexDirection: 'row', 
    paddingHorizontal: scale(20), 
    paddingVertical: verticalScale(16), 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5',
    gap: scale(8)
  },
  periodButton: { 
    flex: 1, 
    paddingVertical: verticalScale(10), 
    borderRadius: moderateScale(20), 
    backgroundColor: '#F5F5F5', 
    alignItems: 'center', 
    marginHorizontal: scale(4) 
  },
  periodButtonActive: { 
    backgroundColor: '#3B82F6' 
  },
  periodText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: '#666' 
  },
  periodTextActive: { 
    color: '#FFFFFF' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  summaryCard: { 
    backgroundColor: '#3B82F6', 
    padding: scale(24), 
    borderRadius: moderateScale(16), 
    marginBottom: verticalScale(20),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  summaryRow: { 
    flexDirection: 'row' 
  },
  summaryItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  summaryDivider: { 
    width: 1, 
    backgroundColor: 'rgba(255,255,255,0.3)' 
  },
  summaryValue: { 
    fontSize: moderateScale(isSmallDevice ? 32 : 36), 
    fontWeight: '800', 
    color: '#FFFFFF', 
    marginBottom: verticalScale(8) 
  },
  summaryLabel: { 
    fontSize: moderateScale(14), 
    color: 'rgba(255,255,255,0.9)' 
  },
  attendanceList: { 
    marginBottom: verticalScale(20) 
  },
  sectionTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(12) 
  },
  attendanceCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  dateSection: { 
    alignItems: 'center', 
    width: scale(70),
    minWidth: scale(60)
  },
  dateText: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(4) 
  },
  dayText: { 
    fontSize: moderateScale(13), 
    color: '#8E8E93' 
  },
  statusSection: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end',
    paddingLeft: scale(10)
  },
  statusIndicator: { 
    width: moderateScale(12), 
    height: moderateScale(12), 
    borderRadius: moderateScale(6), 
    marginRight: scale(16) 
  },
  statusPresent: { 
    backgroundColor: '#50C878' 
  },
  statusAbsent: { 
    backgroundColor: '#EF4444' 
  },
  statusHalfday: { 
    backgroundColor: '#F59E0B' 
  },
  statusInfo: { 
    alignItems: 'flex-end',
    minWidth: scale(70)
  },
  hoursText: { 
    fontSize: moderateScale(15), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(4) 
  },
  earningsText: { 
    fontSize: moderateScale(13), 
    color: '#8E8E93' 
  },
  legendCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  legendTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(12) 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(8) 
  },
  legendDot: { 
    width: moderateScale(12), 
    height: moderateScale(12), 
    borderRadius: moderateScale(6), 
    marginRight: scale(12) 
  },
  legendText: { 
    fontSize: moderateScale(14), 
    color: '#666' 
  },
});