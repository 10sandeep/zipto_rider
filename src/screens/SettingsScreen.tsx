import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Switch, Dimensions, Platform } from 'react-native';
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

export default function SettingsScreen({ navigation }: any) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <SettingRow label="Push Notifications" value={pushNotifications} onValueChange={setPushNotifications} />
            <SettingRow label="Order Alerts" value={orderAlerts} onValueChange={setOrderAlerts} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.settingCard}>
            <SettingRow label="Location Sharing" value={locationSharing} onValueChange={setLocationSharing} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Language</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValue}>English</Text>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>About</Text>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SettingRow = ({ label, value, onValueChange }: any) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch 
      value={value} 
      onValueChange={onValueChange} 
      trackColor={{ false: '#E0E0E0', true: '#3B82F6' }}
      style={{transform: [{scaleX: Platform.OS === 'ios' ? 0.9 : 1}, {scaleY: Platform.OS === 'ios' ? 0.9 : 1}]}}
    />
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
  headerTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  section: { 
    marginBottom: verticalScale(24) 
  },
  sectionTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    marginBottom: verticalScale(12) 
  },
  settingCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: moderateScale(12), 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: scale(16), 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5',
    minHeight: verticalScale(60),
  },
  settingLabel: { 
    fontSize: moderateScale(15), 
    fontWeight: '600', 
    color: '#1C1C1E',
    flex: 1,
    marginRight: scale(12),
  },
  settingValueContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: scale(4) 
  },
  settingValue: { 
    fontSize: moderateScale(15), 
    color: '#8E8E93' 
  },
});