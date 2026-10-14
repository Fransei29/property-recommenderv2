'use client';

import React from 'react';
import { Review, ReviewStats } from '@/lib/api';
import { ReviewCard } from '../ReviewCard/ReviewCard';
import { RatingStars } from '../RatingStars/RatingStars';
import styles from './ReviewList.module.scss';

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
      <div className={styles.emptyState}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.reviewList}>
      {stats && (
        <div className={styles.reviewStats}>
          <div className={styles.statsContent}>
            <div className={styles.avgRating}>
              <span className={styles.ratingValue}>
                {stats.avg_rating || '0.0'}
              </span>
              <RatingStars rating={parseFloat(stats.avg_rating || '0')} size="large" />
            </div>
            <div className={styles.totalReviews}>
              {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      <div className={styles.reviewsContainer}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showResponse={showForm}
            onReport={onReport}
          />
        ))}
      </div>
    </div>
  );
};






