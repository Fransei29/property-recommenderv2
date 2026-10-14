import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './RatingStars.module';

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
  const handlePress = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const starSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const fontSize = size === 'small' ? 10 : size === 'large' ? 16 : 12;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= Math.round(rating);

        return (
          <TouchableOpacity
            key={value}
            onPress={() => handlePress(value)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <Text style={[
              styles.star,
              { fontSize: starSize },
              isFilled ? styles.filled : styles.empty
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
      {readonly && (
        <Text style={[styles.ratingValue, { fontSize }]}>
          ({rating.toFixed(1)})
        </Text>
      )}
    </View>
  );
};


