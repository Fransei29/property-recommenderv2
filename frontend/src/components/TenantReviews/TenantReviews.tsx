'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { reviewsAPI, Review, ReviewStats } from '@/lib/api';
import { ReviewList } from '../ReviewList/ReviewList';
import { ReviewForm } from '../ReviewForm/ReviewForm';
import styles from './TenantReviews.module.scss';

interface TenantReviewsProps {
  tenantId: number;
  tenantName: string;
}

export const TenantReviews: React.FC<TenantReviewsProps> = ({
  tenantId,
  tenantName,
}) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page] = useState(1);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getTenantReviews(tenantId, page, 10);
      setReviews(response.reviews);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (
    rating: number,
    comment: string
  ) => {
    try {
      // Las reviews de tenant no aceptan fotos, solo comentarios
      await reviewsAPI.createTenantReview(tenantId, rating, comment);
      setShowForm(false);
      loadReviews(); // Recargar reviews
    } catch (error) {
      throw error;
    }
  };

  const handleReport = async (reviewId: number) => {
    if (confirm('¿Estás seguro de que quieres reportar esta review?')) {
      try {
        // Aquí implementarías la llamada a la API para reportar
        console.log('Reportando review:', reviewId);
        alert('Review reportada. Gracias por tu feedback.');
      } catch (error) {
        console.error('Error reporting review:', error);
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando reviews...</div>;
  }

  return (
    <div className={styles.tenantReviews}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.sectionTitle}>Reviews de {tenantName}</h2>
        {session && !showForm && (
          <button
            className={styles.addReviewButton}
            onClick={() => setShowForm(true)}
          >
            Dejar Review
          </button>
        )}
      </div>

      {showForm && (
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={() => setShowForm(false)}
          tenantName={tenantName}
          allowPhotos={false}
        />
      )}

      <ReviewList
        reviews={reviews}
        stats={stats || undefined}
        showForm={!!session}
        onReport={handleReport}
        emptyMessage={`Aún no hay reviews para ${tenantName}. ¡Sé el primero en dejar una!`}
      />
    </div>
  );
};

