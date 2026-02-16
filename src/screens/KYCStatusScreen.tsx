import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Platform } from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function KYCStatusScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏳</Text>
        </View>
        <Text style={styles.title}>Verification in Progress</Text>
        <Text style={styles.subtitle}>
          Your documents are being verified. This typically takes 24-48 hours. We'll notify you once approved.
        </Text>
        <View style={styles.statusBox}>
          <StatusItem label="Documents Uploaded" status="completed" />
          <StatusItem label="Verification" status="pending" />
          <StatusItem label="Approval" status="pending" />
        </View>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.replace('MainTabs')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const StatusItem = ({ label, status }: { label: string; status: string }) => (
  <View style={styles.statusItem}>
    <View style={[styles.statusDot, status === 'completed' && styles.statusDotCompleted]} />
    <Text style={styles.statusLabel}>{label}</Text>
    <Text style={[styles.statusText, status === 'completed' && styles.statusTextCompleted]}>
      {status === 'completed' ? '✓' : '○'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: scale(30) 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
  },
  iconContainer: { 
    width: moderateScale(100), 
    height: moderateScale(100), 
    borderRadius: moderateScale(50), 
    backgroundColor: '#FFF9E6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: verticalScale(24),
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: { 
    fontSize: moderateScale(isSmallDevice ? 45 : 50) 
  },
  title: { 
    fontSize: moderateScale(isSmallDevice ? 24 : 28), 
    fontWeight: '800', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(12), 
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  subtitle: { 
    fontSize: moderateScale(16), 
    color: '#8E8E93', 
    textAlign: 'center', 
    lineHeight: moderateScale(24), 
    marginBottom: verticalScale(40),
    paddingHorizontal: scale(10),
  },
  statusBox: { 
    width: '100%', 
    backgroundColor: '#F5F5F5', 
    borderRadius: moderateScale(16), 
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(16),
    minHeight: verticalScale(32),
  },
  statusDot: { 
    width: moderateScale(12), 
    height: moderateScale(12), 
    borderRadius: moderateScale(6), 
    backgroundColor: '#E0E0E0', 
    marginRight: scale(12) 
  },
  statusDotCompleted: { 
    backgroundColor: '#50C878' 
  },
  statusLabel: { 
    flex: 1, 
    fontSize: moderateScale(15), 
    fontWeight: '600', 
    color: '#1C1C1E' 
  },
  statusText: { 
    fontSize: moderateScale(18), 
    color: '#E0E0E0' 
  },
  statusTextCompleted: { 
    color: '#50C878' 
  },
  button: { 
    backgroundColor: '#FF6B35', 
    paddingVertical: verticalScale(18), 
    borderRadius: moderateScale(15), 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(30),
    minHeight: verticalScale(54),
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: moderateScale(18), 
    fontWeight: '700' 
  },
});