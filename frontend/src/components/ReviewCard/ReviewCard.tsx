'use client';

import React from 'react';
import { Review } from '@/lib/api';
import { RatingStars } from '../RatingStars/RatingStars';
import styles from './ReviewCard.module.scss';
import { resolveImageUrl } from '@/utils';

interface ReviewCardProps {
  review: Review;
  showResponse?: boolean;
  onReport?: (reviewId: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showResponse = false,
  onReport,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          <div className={styles.avatar}>
            {review.username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.reviewerDetails}>
            <span className={styles.username}>{review.username}</span>
            <span className={styles.date}>{formatDate(review.created_at)}</span>
          </div>
        </div>
        <div className={styles.reviewMeta}>
          <RatingStars rating={review.rating} size="small" />
          {review.is_verified && (
            <span className={styles.verifiedBadge} title="Review verificada">
              ✓ Verificado
            </span>
          )}
        </div>
      </div>

      {review.comment && (
        <div className={styles.reviewComment}>
          <p>{review.comment}</p>
        </div>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className={styles.reviewPhotos}>
          {review.photos.map((photo, index) => (
            <img
              key={index}
              src={resolveImageUrl(photo, '')}
              alt={`Foto ${index + 1} de la review`}
              className={styles.photo}
            />
          ))}
        </div>
      )}

      {showResponse && onReport && (
        <div className={styles.reviewActions}>
          <button
            className={styles.reportButton}
            onClick={() => onReport(review.id)}
          >
            Reportar
          </button>
        </div>
      )}
    </div>
  );
};






