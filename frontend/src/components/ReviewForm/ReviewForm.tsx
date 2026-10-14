'use client';

import React, { useState } from 'react';
import { RatingStars } from '../RatingStars/RatingStars';
import styles from './ReviewForm.module.scss';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string, photos?: File[]) => Promise<void>;
  onCancel?: () => void;
  propertyTitle?: string;
  tenantName?: string;
  allowPhotos?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  propertyTitle,
  tenantName,
  allowPhotos = true,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor, selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, comment, photos.length > 0 ? photos : undefined);
      // Reset form
      setRating(0);
      setComment('');
      setPhotos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Máximo 5 fotos
      setPhotos(files);
    }
  };

  return (
    <form className={styles.reviewForm} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>
        {propertyTitle ? `Dejar review de "${propertyTitle}"` : `Dejar review de ${tenantName || 'esta inmobiliaria'}`}
      </h3>

      <div className={styles.ratingSection}>
        <label className={styles.label}>Calificación *</label>
        <RatingStars
          rating={rating}
          readonly={false}
          onRatingChange={setRating}
          size="large"
        />
      </div>

      <div className={styles.commentSection}>
        <label htmlFor="comment" className={styles.label}>
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia..."
          rows={5}
          maxLength={2000}
        />
        <span className={styles.charCount}>{comment.length}/2000</span>
      </div>

      {allowPhotos && (
        <div className={styles.photosSection}>
          <label htmlFor="photos" className={styles.label}>
            Fotos (opcional, máximo 5)
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className={styles.fileInput}
          />
          {photos.length > 0 && (
            <div className={styles.photosPreview}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoPreview}>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className={styles.removePhoto}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formActions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Review'}
        </button>
      </div>
    </form>
  );
};

