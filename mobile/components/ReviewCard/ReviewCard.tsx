import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Review } from '@/lib/api';
import { RatingStars } from '../RatingStars';
import { styles } from './ReviewCard.module';

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

  const getAPIUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {review.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={styles.username}>{review.username}</Text>
            <Text style={styles.date}>{formatDate(review.created_at)}</Text>
          </View>
        </View>
        <View style={styles.reviewMeta}>
          <RatingStars rating={review.rating} size="small" />
          {review.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificado</Text>
            </View>
          )}
        </View>
      </View>

      {review.comment && (
        <View style={styles.reviewComment}>
          <Text style={styles.commentText}>{review.comment}</Text>
        </View>
      )}

      {review.photos && review.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotos}>
          {review.photos.map((photo, index) => {
            const API_URL = getAPIUrl();
            const photoUri = photo.startsWith('http') 
              ? photo 
              : `${API_URL}${photo}`;
            return (
              <Image
                key={index}
                source={{ uri: photoUri }}
                style={styles.photo}
                resizeMode="cover"
              />
            );
          })}
        </ScrollView>
      )}

      {showResponse && onReport && (
        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReport(review.id)}
          >
            <Text style={styles.reportButtonText}>Reportar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

