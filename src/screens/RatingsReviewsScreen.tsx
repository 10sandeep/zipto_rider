import React, {useState, useEffect} from 'react';
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
  getDriverRatings,
  DriverRatingsResponse,
} from '../services/driverService';
import {useAuthStore} from '../store/authStore';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

export default function RatingsReviewsScreen({navigation}: any) {
  const {user} = useAuthStore();
  const [data, setData] = useState<DriverRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await getDriverRatings(user.id);
        setData(response);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [user?.id]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const avgRating = data?.statistics?.average_rating || 0;
  const totalReviews = data?.statistics?.total_ratings || 0;
  const reviews = data?.ratings || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#3B82F6"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={{width: moderateScale(24)}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.ratingCard}>
          <Text style={styles.ratingValue}>{avgRating}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Text key={star} style={styles.star}>
                {star <= Math.floor(avgRating) ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={styles.ratingCount}>{totalReviews} total ratings</Text>
        </View>

        <View style={styles.distributionCard}>
          <Text style={styles.sectionTitle}>Rating Distribution</Text>
          <Text
            style={{
              color: '#666',
              fontSize: 14,
              textAlign: 'center',
              marginVertical: 10,
            }}>
            Detailed distribution coming soon
          </Text>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map(review => {
              const customerName = review.customer?.name || 'Customer';
              const dateObj = new Date(review.created_at);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.customerAvatar}>
                      <Text style={styles.avatarText}>
                        {customerName[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewHeaderInfo}>
                      <Text style={styles.customerName}>{customerName}</Text>
                      <Text style={styles.reviewDate}>{formattedDate}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>
                        {review.rating} ⭐
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.review}</Text>
                  {review.order && (
                    <Text style={styles.orderId}>
                      Order: {review.order.order_number}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#666'}}>No reviews found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const RatingBar = ({stars, percentage, count}: any) => (
  <View style={styles.ratingBarContainer}>
    <Text style={styles.starLabel}>{stars} ⭐</Text>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, {width: `${percentage}%`}]} />
    </View>
    <Text style={styles.countText}>{count}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    color: '#1C1C1E',
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: verticalScale(100),
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
    marginBottom: verticalScale(12),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
  },
  star: {
    fontSize: moderateScale(24),
    marginHorizontal: scale(2),
  },
  ratingCount: {
    fontSize: moderateScale(16),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(16),
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  starLabel: {
    width: scale(60),
    fontSize: moderateScale(14),
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: verticalScale(8),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginHorizontal: scale(12),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: moderateScale(4),
  },
  countText: {
    width: scale(40),
    fontSize: moderateScale(14),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'right',
  },
  reviewsSection: {
    marginBottom: verticalScale(20),
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
    marginBottom: verticalScale(12),
  },
  customerAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  avatarText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(2),
  },
  reviewDate: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
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
    fontFamily: 'Poppins-Regular',
    color: '#F59E0B',
  },
  reviewComment: {
    fontSize: moderateScale(14),
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  orderId: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
});
