/**
 * Componente RecommendationList - Lista de propiedades recomendadas
 */

import React from 'react';
import { RecommendationListProps } from '../../types/types';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { formatPrice } from '../../utils';
import styles from './RecommendationList.module.scss';

export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  onPropertyClick,
  className = ''
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.recommendationList} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.subtitle}>
          Basado en tus preferencias, te recomendamos estas propiedades
        </p>
      </div>

      {/* Lista de recomendaciones */}
      <div className={styles.grid}>
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.property.id}
            className={styles.recommendationItem}
            onClick={() => onPropertyClick(recommendation.property)}
          >
            {/* Tarjeta de propiedad */}
            <PropertyCard
              property={recommendation.property}
              isFavorite={false} // Los favoritos se manejan en el componente padre
              onToggleFavorite={() => {}} // Se maneja en el componente padre
              onClick={onPropertyClick}
              className={styles.propertyCard}
            />

            {/* Información de similitud */}
            <div className={styles.similarityInfo}>
              <div className={styles.similarityScore}>
                <span className={styles.scoreLabel}>Similitud:</span>
                <span className={styles.scoreValue}>
                  {Math.round(recommendation.similarityScore * 100)}%
                </span>
              </div>

              {/* Razones de similitud */}
              {recommendation.reasons.length > 0 && (
                <div className={styles.reasons}>
                  <span className={styles.reasonsLabel}>Razones:</span>
                  <ul className={styles.reasonsList}>
                    {recommendation.reasons.map((reason, reasonIndex) => (
                      <li key={reasonIndex} className={styles.reason}>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precio comparativo */}
              <div className={styles.priceComparison}>
                <span className={styles.priceLabel}>Precio:</span>
                <span className={styles.priceValue}>
                  {formatPrice(recommendation.property.precio)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informativo */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Las recomendaciones se basan en similitud de ubicación, tipo de propiedad, 
          precio y características. Selecciona una propiedad para ver más detalles.
        </p>
      </div>
    </div>
  );
}; 