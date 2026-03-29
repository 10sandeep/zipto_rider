import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, Platform } from 'react-native';
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

const notifications = [
  { id: '1', title: 'New Order Assigned', message: 'Order #ORD12345 has been assigned to you', time: '5 min ago', read: false },
  { id: '2', title: 'Delivery Completed', message: 'You successfully completed Order #ORD12344', time: '1 hour ago', read: false },
  { id: '3', title: 'Payment Received', message: '₹2,850 has been credited to your account', time: '2 hours ago', read: true },
  { id: '4', title: 'Weekly Summary', message: 'You earned ₹18,500 this week. Great job!', time: '1 day ago', read: true },
];

export default function NotificationsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notificationCard, !notif.read && styles.unreadCard]}
            activeOpacity={0.7}
          >
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            <Text style={styles.notifMessage}>{notif.message}</Text>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: { 
    fontSize: moderateScale(28), 
    color: '#1C1C1E' 
  },
  headerTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: scale(10),
  },
  clearText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#FF6B35' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  notificationCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(12), 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: verticalScale(80),
  },
  unreadCard: { 
    borderLeftWidth: scale(4), 
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFFAF7',
  },
  notifHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: verticalScale(8),
    paddingRight: scale(12),
  },
  notifTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    flex: 1,
    marginRight: scale(8),
  },
  notifTime: { 
    fontSize: moderateScale(12), 
    fontFamily: 'Poppins-Regular',
    color: '#8E8E93',
    flexShrink: 0,
  },
  notifMessage: { 
    fontSize: moderateScale(14), 
    color: '#666', 
    fontFamily: 'Poppins-Regular',
    lineHeight: moderateScale(20) 
  },
  unreadDot: { 
    position: 'absolute', 
    top: scale(16), 
    right: scale(16), 
    width: moderateScale(8), 
    height: moderateScale(8), 
    borderRadius: moderateScale(4), 
    backgroundColor: '#FF6B35' 
  },
});