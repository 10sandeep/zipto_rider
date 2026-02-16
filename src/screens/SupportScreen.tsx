import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking, Dimensions, Platform } from 'react-native';
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

export default function SupportScreen({ navigation }: any) {
  const handleCall = () => Linking.openURL('tel:1800123456');
  const handleEmail = () => Linking.openURL('mailto:support@quickdeliver.com');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/918765432100');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>💬</Text>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>We're here 24/7 to assist you</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Text style={styles.iconEmoji}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Call Support</Text>
              <Text style={styles.contactValue}>1800-123-456</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleWhatsApp}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Text style={styles.iconEmoji}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>+91 87654 32100</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Text style={styles.iconEmoji}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@quickdeliver.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I update my documents?</Text>
            <Text style={styles.faqAnswer}>Go to Profile → Vehicle Details and upload new documents.</Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>When do I receive payments?</Text>
            <Text style={styles.faqAnswer}>Payments are processed weekly, every Monday.</Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How to report an issue?</Text>
            <Text style={styles.faqAnswer}>Use the contact options above to reach our support team.</Text>
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
    color: '#1C1C1E' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  heroCard: { 
    backgroundColor: '#3B82F6', 
    padding: scale(32), 
    borderRadius: moderateScale(20), 
    alignItems: 'center', 
    marginBottom: verticalScale(24),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroIcon: { 
    fontSize: moderateScale(isSmallDevice ? 50 : 60), 
    marginBottom: verticalScale(16) 
  },
  heroTitle: { 
    fontSize: moderateScale(isSmallDevice ? 20 : 24), 
    fontWeight: '800', 
    color: '#FFFFFF', 
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  heroSubtitle: { 
    fontSize: moderateScale(15), 
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: { 
    marginBottom: verticalScale(24) 
  },
  sectionTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(12) 
  },
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: verticalScale(80),
  },
  contactIcon: { 
    width: moderateScale(48), 
    height: moderateScale(48), 
    borderRadius: moderateScale(24), 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: scale(12) 
  },
  iconEmoji: { 
    fontSize: moderateScale(24) 
  },
  contactInfo: { 
    flex: 1,
    marginRight: scale(8),
  },
  contactLabel: { 
    fontSize: moderateScale(14), 
    color: '#8E8E93', 
    marginBottom: verticalScale(4) 
  },
  contactValue: { 
    fontSize: moderateScale(16), 
    fontWeight: '600', 
    color: '#1C1C1E' 
  },
  faqCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQuestion: { 
    fontSize: moderateScale(15), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(8) 
  },
  faqAnswer: { 
    fontSize: moderateScale(14), 
    color: '#666', 
    lineHeight: moderateScale(20) 
  },
});