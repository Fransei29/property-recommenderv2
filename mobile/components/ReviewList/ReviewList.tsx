import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Review, ReviewStats } from '@/lib/api';
import { ReviewCard } from '../ReviewCard';
import { RatingStars } from '../RatingStars';
import { styles } from './ReviewList.module';

interface ReviewListProps {
  reviews: Review[];
  stats?: ReviewStats;
  showForm?: boolean;
  onReport?: (reviewId: number) => void;
  emptyMessage?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  stats,
  showForm = false,
  onReport,
  emptyMessage = 'Aún no hay reviews. ¡Sé el primero en dejar una!',
}) => {
  if (reviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.reviewList}>
      {stats && (
        <View style={styles.reviewStats}>
          <View style={styles.statsContent}>
            <View style={styles.avgRating}>
              <Text style={styles.ratingValue}>
                {stats.avg_rating || '0.0'}
              </Text>
              <RatingStars 
                rating={parseFloat(stats.avg_rating || '0')} 
                size="large" 
              />
            </View>
            <Text style={styles.totalReviews}>
              {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.reviewsContainer}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showResponse={showForm}
            onReport={onReport}
          />
        ))}
      </ScrollView>
    </View>
  );
};

