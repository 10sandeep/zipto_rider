import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getCalendar,
  CalendarResponse,
  CalendarDay,
} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (s: number) => (SCREEN_WIDTH / 375) * s;
const verticalScale = (s: number) => (SCREEN_HEIGHT / 812) * s;
const moderateScale = (s: number, f = 0.5) => s + (scale(s) - s) * f;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Returns Monday of the week containing `date`
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'short'};
  return `${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', {...opts, year: 'numeric'})}`;
}

export default function AttendanceScreen({navigation}: any) {
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [weekMonday, setWeekMonday] = useState<Date>(getMondayOf(new Date()));
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCalendar(
        period,
        year,
        month,
        period === 'week' ? isoDate(weekMonday) : undefined,
      );
      setData(res);
      setSelectedDay(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, year, month, weekMonday]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // ── Navigation helpers ──────────────────────────────────────────
  const prevMonth = () => {
    if (month === 1) {setYear(y => y - 1); setMonth(12);}
    else {setMonth(m => m - 1);}
  };
  const nextMonth = () => {
    if (month === 12) {setYear(y => y + 1); setMonth(1);}
    else {setMonth(m => m + 1);}
  };
  const prevWeek = () => setWeekMonday(d => addDays(d, -7));
  const nextWeek = () => setWeekMonday(d => addDays(d, 7));

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;
  const weekSunday = addDays(weekMonday, 6);
  const isCurrentWeek = isoDate(getMondayOf(new Date())) === isoDate(weekMonday);

  // ── Calendar grid helpers ───────────────────────────────────────
  const buildMonthGrid = () => {
    if (!data) {return [];}
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
    // Grid starts on Monday — offset for first day
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const cells: (CalendarDay | null)[] = Array(offset).fill(null);
    data.days.forEach(d => cells.push(d));
    // Pad to full rows
    while (cells.length % 7 !== 0) {cells.push(null);}
    return cells;
  };

  const dayColor = (d: CalendarDay | null) => {
    if (!d) {return 'transparent';}
    if (d.is_present && d.hours_worked >= 6) {return '#16A34A';}
    if (d.is_present) {return '#F59E0B';}
    return '#EF4444';
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity
          onPress={fetch}
          hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="refresh" size={moderateScale(22)} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Period toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'month' && styles.toggleBtnActive]}
          onPress={() => setPeriod('month')}
          activeOpacity={0.8}>
          <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'week' && styles.toggleBtnActive]}
          onPress={() => setPeriod('week')}
          activeOpacity={0.8}>
          <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>
            Weekly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation row */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={period === 'month' ? prevMonth : prevWeek}
          hitSlop={{top:10,bottom:10,left:10,right:10}}
          style={styles.navArrow}>
          <Ionicons name="chevron-back" size={moderateScale(22)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.navLabel}>
          {period === 'month'
            ? `${MONTH_NAMES[month - 1]} ${year}`
            : formatDateRange(weekMonday, weekSunday)}
        </Text>
        <TouchableOpacity
          onPress={period === 'month' ? nextMonth : nextWeek}
          disabled={period === 'month' ? isCurrentMonth : isCurrentWeek}
          hitSlop={{top:10,bottom:10,left:10,right:10}}
          style={styles.navArrow}>
          <Ionicons
            name="chevron-forward"
            size={moderateScale(22)}
            color={
              (period === 'month' ? isCurrentMonth : isCurrentWeek)
                ? '#D1D5DB'
                : '#3B82F6'
            }
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : !data ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={moderateScale(48)} color="#D1D5DB" />
          <Text style={styles.emptyText}>Could not load attendance data</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Summary cards */}
          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Days Present"
              value={`${data.summary.days_present}`}
              sub={`of ${data.summary.total_days}`}
              icon="calendar"
              color="#3B82F6"
            />
            <SummaryCard
              label="Total Earnings"
              value={formatCurrency(data.summary.total_earnings)}
              sub={`${data.summary.total_trips} trips`}
              icon="cash"
              color="#16A34A"
            />
            <SummaryCard
              label="Hours Worked"
              value={`${data.summary.total_hours}h`}
              sub={`avg ${data.summary.days_present > 0
                ? (data.summary.total_hours / data.summary.days_present).toFixed(1)
                : 0}h/day`}
              icon="time"
              color="#7C3AED"
            />
            <SummaryCard
              label="Total Trips"
              value={`${data.summary.total_trips}`}
              sub={`avg ${data.summary.days_present > 0
                ? (data.summary.total_trips / data.summary.days_present).toFixed(1)
                : 0}/day`}
              icon="bicycle"
              color="#F59E0B"
            />
          </View>

          {/* Calendar grid (month view) */}
          {period === 'month' && (
            <View style={styles.calendarCard}>
              <Text style={styles.sectionLabel}>Calendar</Text>
              {/* Day headers */}
              <View style={styles.calHeaderRow}>
                {DAY_HEADERS.map(d => (
                  <Text key={d} style={styles.calHeaderCell}>{d}</Text>
                ))}
              </View>
              {/* Grid rows */}
              {chunk(buildMonthGrid(), 7).map((row, ri) => (
                <View key={ri} style={styles.calRow}>
                  {row.map((cell, ci) => {
                    if (!cell) {
                      return <View key={ci} style={styles.calCell} />;
                    }
                    const dayNum = parseInt(cell.date.split('-')[2], 10);
                    const isToday = cell.date === isoDate(new Date());
                    const isSelected = selectedDay?.date === cell.date;
                    return (
                      <TouchableOpacity
                        key={ci}
                        style={[
                          styles.calCell,
                          isSelected && styles.calCellSelected,
                        ]}
                        onPress={() =>
                          setSelectedDay(isSelected ? null : cell)
                        }
                        activeOpacity={0.7}>
                        <View
                          style={[
                            styles.calDot,
                            {backgroundColor: dayColor(cell)},
                            isToday && styles.calDotToday,
                          ]}
                        />
                        <Text
                          style={[
                            styles.calDayNum,
                            isToday && styles.calDayNumToday,
                          ]}>
                          {dayNum}
                        </Text>
                        {cell.is_present && (
                          <Text style={styles.calEarning}>
                            ₹{Math.round(cell.earnings / 100)}
                            <Text style={{fontSize: moderateScale(7)}}>00</Text>
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              {/* Legend */}
              <View style={styles.legendRow}>
                <LegendDot color="#16A34A" label="Full day (≥6h)" />
                <LegendDot color="#F59E0B" label="Partial day" />
                <LegendDot color="#EF4444" label="Absent" />
              </View>
            </View>
          )}

          {/* Selected day detail (month view) */}
          {period === 'month' && selectedDay && selectedDay.is_present && (
            <DayDetail day={selectedDay} />
          )}

          {/* Day cards (week view) */}
          {period === 'week' && (
            <>
              <Text style={styles.sectionLabel}>Daily Breakdown</Text>
              {data.days.map(day => (
                <DayCard key={day.date} day={day} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string; sub: string;
  icon: string; color: string;
}) {
  return (
    <View style={[summaryStyles.card, {borderTopColor: color}]}>
      <Ionicons name={icon} size={moderateScale(20)} color={color} />
      <Text style={summaryStyles.value}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.sub}>{sub}</Text>
    </View>
  );
}

function DayCard({day}: {day: CalendarDay}) {
  const [open, setOpen] = useState(false);
  const dateObj = new Date(day.date + 'T00:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
  const isToday = day.date === isoDate(new Date());

  return (
    <TouchableOpacity
      style={[
        styles.dayCard,
        !day.is_present && styles.dayCardAbsent,
        isToday && styles.dayCardToday,
      ]}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.8}>
      <View style={styles.dayCardLeft}>
        <View style={[styles.dayStatusDot, {backgroundColor: day.is_present ? '#16A34A' : '#EF4444'}]} />
        <View>
          <Text style={styles.dayCardDate}>{dateLabel}</Text>
          <Text style={styles.dayCardDow}>{day.day_of_week}{isToday ? ' · Today' : ''}</Text>
        </View>
      </View>
      <View style={styles.dayCardRight}>
        {day.is_present ? (
          <>
            <Text style={styles.dayCardEarnings}>
              ₹{day.earnings.toLocaleString('en-IN', {maximumFractionDigits: 0})}
            </Text>
            <Text style={styles.dayCardHours}>{day.hours_worked}h · {day.trips} trips</Text>
          </>
        ) : (
          <Text style={styles.dayCardAbsentText}>Off</Text>
        )}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={moderateScale(16)}
          color="#9CA3AF"
          style={{marginLeft: scale(4)}}
        />
      </View>
      {open && day.is_present && (
        <View style={styles.dayCardExpanded}>
          <InfoRow icon="time-outline" label="First trip" value={day.first_trip_at ?? '—'} />
          <InfoRow icon="flag-outline" label="Last trip" value={day.last_trip_at ?? '—'} />
          <InfoRow icon="bicycle-outline" label="Trips" value={String(day.trips)} />
          <InfoRow icon="hourglass-outline" label="Hours" value={`${day.hours_worked}h`} />
          <InfoRow
            icon="cash-outline"
            label="Earnings"
            value={`₹${day.earnings.toLocaleString('en-IN', {maximumFractionDigits: 0})}`}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function DayDetail({day}: {day: CalendarDay}) {
  const dateObj = new Date(day.date + 'T00:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailTitle}>{dateLabel}</Text>
      <View style={styles.detailGrid}>
        <DetailStat label="Earnings" value={`₹${day.earnings.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
        <DetailStat label="Trips" value={String(day.trips)} />
        <DetailStat label="Hours" value={`${day.hours_worked}h`} />
        <DetailStat label="First Trip" value={day.first_trip_at ?? '—'} />
        <DetailStat label="Last Trip" value={day.last_trip_at ?? '—'} />
      </View>
    </View>
  );
}

function DetailStat({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailStat}>
      <Text style={styles.detailStatValue}>{value}</Text>
      <Text style={styles.detailStatLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({icon, label, value}: {icon: string; label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={moderateScale(14)} color="#6B7280" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LegendDot({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, {backgroundColor: color}]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(14),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C1C1E',
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    gap: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(20),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  toggleBtnActive: {backgroundColor: '#3B82F6'},
  toggleText: {fontSize: moderateScale(14), fontWeight: '600', color: '#6B7280'},
  toggleTextActive: {color: '#FFFFFF'},
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  navArrow: {padding: scale(4)},
  navLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    flex: 1,
  },
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {fontSize: moderateScale(14), color: '#9CA3AF', marginTop: verticalScale(12)},
  scrollContent: {padding: scale(16), paddingBottom: verticalScale(100)},
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: verticalScale(16),
  },
  // Calendar
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(12),
  },
  calHeaderRow: {flexDirection: 'row', marginBottom: verticalScale(6)},
  calHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#6B7280',
  },
  calRow: {flexDirection: 'row', marginBottom: verticalScale(4)},
  calCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  calCellSelected: {backgroundColor: '#EFF6FF'},
  calDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(2),
  },
  calDotToday: {
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
  },
  calDayNum: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  calDayNumToday: {color: '#3B82F6'},
  calEarning: {
    fontSize: moderateScale(8),
    color: '#16A34A',
    fontWeight: '600',
    marginTop: verticalScale(1),
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
    gap: scale(12),
    flexWrap: 'wrap',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    marginRight: scale(5),
  },
  legendText: {fontSize: moderateScale(11), color: '#6B7280'},
  // Day detail popup (month view)
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  detailTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  detailStat: {
    minWidth: '28%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(10),
    padding: scale(10),
  },
  detailStatValue: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#1C1C1E',
  },
  detailStatLabel: {
    fontSize: moderateScale(10),
    color: '#6B7280',
    marginTop: verticalScale(2),
    textTransform: 'uppercase',
  },
  // Day cards (week view)
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dayCardAbsent: {opacity: 0.6},
  dayCardToday: {borderLeftWidth: 3, borderLeftColor: '#3B82F6'},
  dayCardLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  dayStatusDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    marginRight: scale(12),
  },
  dayCardDate: {fontSize: moderateScale(15), fontWeight: '700', color: '#1C1C1E'},
  dayCardDow: {fontSize: moderateScale(12), color: '#8E8E93', marginTop: verticalScale(2)},
  dayCardRight: {flexDirection: 'row', alignItems: 'center'},
  dayCardEarnings: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#16A34A',
    marginRight: scale(6),
  },
  dayCardHours: {fontSize: moderateScale(12), color: '#8E8E93'},
  dayCardAbsentText: {fontSize: moderateScale(14), color: '#9CA3AF', marginRight: scale(4)},
  dayCardExpanded: {
    width: '100%',
    marginTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: verticalScale(10),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  infoLabel: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginLeft: scale(8),
  },
  infoValue: {fontSize: moderateScale(13), fontWeight: '600', color: '#1C1C1E'},
});

const summaryStyles = StyleSheet.create({
  card: {
    width: (SCREEN_WIDTH - scale(52)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    padding: scale(14),
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  value: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(2),
  },
  label: {fontSize: moderateScale(12), fontWeight: '700', color: '#1C1C1E'},
  sub: {fontSize: moderateScale(11), color: '#8E8E93', marginTop: verticalScale(2)},
});
