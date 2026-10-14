'use client';

import React from 'react';
import styles from './RatingStars.module.scss';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  readonly = true,
  onRatingChange,
}) => {
  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  // handleMouseEnter puede usarse para efectos hover en el futuro
  // const handleMouseEnter = (value: number) => {
  //   if (!readonly) {
  //     // Puedes agregar hover effect aquí si quieres
  //   }
  // };

  return (
    <div className={`${styles.ratingStars} ${styles[size]}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= Math.round(rating);
        const isHalf = value - 0.5 <= rating && rating < value;

        return (
          <span
            key={value}
            className={`${styles.star} ${isFilled ? styles.filled : ''} ${isHalf ? styles.half : ''} ${!readonly ? styles.clickable : ''}`}
            onClick={() => handleClick(value)}
            role={readonly ? undefined : 'button'}
            aria-label={`${value} estrellas`}
          >
            ★
          </span>
        );
      })}
      {readonly && (
        <span className={styles.ratingValue}>({rating.toFixed(1)})</span>
      )}
    </div>
  );
};

