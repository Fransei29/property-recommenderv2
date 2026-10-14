import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RatingStars } from '../RatingStars';
import { styles } from './ReviewForm.module';

interface ReviewFormProps {
  onSubmit: (rating: number, comment?: string) => Promise<void>;
  onCancel: () => void;
  propertyTitle?: string;
  tenantName?: string;
  allowPhotos?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  propertyTitle,
  tenantName,
  allowPhotos = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor, selecciona una calificación');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(rating, comment.trim() || undefined);
      setRating(0);
      setComment('');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al enviar la review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {propertyTitle ? `Review de ${propertyTitle}` : tenantName ? `Review de ${tenantName}` : 'Dejar Review'}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.ratingSection}>
          <Text style={styles.label}>Calificación</Text>
          <RatingStars
            rating={rating}
            readonly={false}
            onRatingChange={setRating}
            size="large"
          />
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.label}>Comentario (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe tu opinión..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {allowPhotos && (
          <View style={styles.photosSection}>
            <Text style={styles.label}>Fotos (opcional)</Text>
            <Text style={styles.photoNote}>
              La subida de fotos estará disponible próximamente
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButtonAction]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

