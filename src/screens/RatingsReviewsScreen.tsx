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

const reviews = [
  { id: '1', customer: 'Ankit S.', rating: 5, comment: 'Very professional and on time!', date: 'Jan 26, 2026', orderId: 'ORD12345' },
  { id: '2', customer: 'Priya M.', rating: 5, comment: 'Great service, handled the package with care.', date: 'Jan 25, 2026', orderId: 'ORD12344' },
  { id: '3', customer: 'Rahul K.', rating: 4, comment: 'Good delivery, but was 10 mins late.', date: 'Jan 24, 2026', orderId: 'ORD12343' },
  { id: '4', customer: 'Sneha R.', rating: 5, comment: 'Excellent! Very polite and helpful.', date: 'Jan 23, 2026', orderId: 'ORD12342' },
];

export default function RatingsReviewsScreen({ navigation }: any) {
  const avgRating = 4.8;
  const totalReviews = 245;

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
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ratingCard}>
          <Text style={styles.ratingValue}>{avgRating}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.star}>
                {star <= Math.floor(avgRating) ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={styles.ratingCount}>{totalReviews} total ratings</Text>
        </View>

        <View style={styles.distributionCard}>
          <Text style={styles.sectionTitle}>Rating Distribution</Text>
          <RatingBar stars={5} percentage={75} count={184} />
          <RatingBar stars={4} percentage={18} count={44} />
          <RatingBar stars={3} percentage={5} count={12} />
          <RatingBar stars={2} percentage={1} count={3} />
          <RatingBar stars={1} percentage={1} count={2} />
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.avatarText}>{review.customer[0]}</Text>
                </View>
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.customerName}>{review.customer}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>{review.rating} ⭐</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.orderId}>Order: {review.orderId}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const RatingBar = ({ stars, percentage, count }: any) => (
  <View style={styles.ratingBarContainer}>
    <Text style={styles.starLabel}>{stars} ⭐</Text>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${percentage}%` }]} />
    </View>
    <Text style={styles.countText}>{count}</Text>
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
    color: '#1C1C1E' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  ratingCard: { 
    backgroundColor: '#3B82F6', 
    padding: scale(32), 
    borderRadius: moderateScale(20), 
    alignItems: 'center', 
    marginBottom: verticalScale(20),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ratingValue: { 
    fontSize: moderateScale(isSmallDevice ? 56 : 64), 
    fontWeight: '800', 
    color: '#FFFFFF', 
    marginBottom: verticalScale(12) 
  },
  starsContainer: { 
    flexDirection: 'row', 
    marginBottom: verticalScale(8) 
  },
  star: { 
    fontSize: moderateScale(24), 
    marginHorizontal: scale(2) 
  },
  ratingCount: { 
    fontSize: moderateScale(16), 
    color: 'rgba(255,255,255,0.9)', 
    fontWeight: '500' 
  },
  distributionCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(20), 
    borderRadius: moderateScale(16), 
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(16) 
  },
  ratingBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(12) 
  },
  starLabel: { 
    width: scale(60), 
    fontSize: moderateScale(14), 
    color: '#666' 
  },
  progressBar: { 
    flex: 1, 
    height: verticalScale(8), 
    backgroundColor: '#F5F5F5', 
    borderRadius: moderateScale(4), 
    overflow: 'hidden', 
    marginHorizontal: scale(12) 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#FFD700', 
    borderRadius: moderateScale(4) 
  },
  countText: { 
    width: scale(40), 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: '#666', 
    textAlign: 'right' 
  },
  reviewsSection: { 
    marginBottom: verticalScale(20) 
  },
  reviewCard: { 
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
  reviewHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(12) 
  },
  customerAvatar: { 
    width: moderateScale(40), 
    height: moderateScale(40), 
    borderRadius: moderateScale(20), 
    backgroundColor: '#3B82F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: scale(12) 
  },
  avatarText: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  reviewHeaderInfo: { 
    flex: 1 
  },
  customerName: { 
    fontSize: moderateScale(15), 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(2) 
  },
  reviewDate: { 
    fontSize: moderateScale(12), 
    color: '#8E8E93' 
  },
  ratingBadge: { 
    backgroundColor: '#FFF9E6', 
    paddingHorizontal: scale(10), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(12),
    flexShrink: 0,
  },
  ratingBadgeText: { 
    fontSize: moderateScale(13), 
    fontWeight: '700', 
    color: '#F59E0B' 
  },
  reviewComment: { 
    fontSize: moderateScale(14), 
    color: '#666', 
    lineHeight: moderateScale(20), 
    marginBottom: verticalScale(8) 
  },
  orderId: { 
    fontSize: moderateScale(12), 
    color: '#8E8E93', 
    fontWeight: '500' 
  },
});