/**
 * Componente PropertyDetail - Vista detallada de una propiedad
 */

import React from 'react';
import Image from 'next/image';
import { Property, RecommendationResult } from '../../types/types';
import { formatPrice, getPropertyTypeLabel } from '../../utils';
import styles from './PropertyDetail.module.scss';

interface PropertyDetailProps {
  property: Property;
  recommendations: RecommendationResult[];
  onPropertyClick: (property: Property) => void;
  onBackClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: number) => void;
  className?: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  recommendations,
  onPropertyClick,
  onBackClick,
  isFavorite,
  onToggleFavorite,
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Botón de regreso */}
      <button onClick={onBackClick} className={styles.backButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver al listado
      </button>

      <div className={styles.content}>
        {/* Imagen principal */}
        <div className={styles.imageSection}>
          <Image
            src={property.imagen}
            alt={property.titulo}
            width={800}
            height={600}
            className={styles.mainImage}
            priority
            unoptimized
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Información de la propiedad */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1 className={styles.title}>{property.titulo}</h1>
            <p className={styles.location}>{property.ciudad}</p>
            <div className={styles.typeBadge}>
              {getPropertyTypeLabel(property.tipo)}
            </div>
          </div>

          <div className={styles.price}>
            <span className={styles.priceAmount}>
              {formatPrice(property.precio)}
            </span>
          </div>

          {/* Detalles */}
          <div className={styles.details}>
            <div className={styles.detail}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>{property.ambientes} ambientes</span>
            </div>
            
            <div className={styles.detail}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
              <span>{property.metros_cuadrados}m²</span>
            </div>
          </div>

          {/* Descripción */}
          {property.descripcion && (
            <div className={styles.description}>
              <h3>Descripción</h3>
              <p>{property.descripcion}</p>
            </div>
          )}

          {/* Características */}
          {property.caracteristicas && property.caracteristicas.length > 0 && (
            <div className={styles.features}>
              <h3>Características</h3>
              <div className={styles.featuresList}>
                {property.caracteristicas.map((feature, index) => (
                  <span key={index} className={styles.feature}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h2>Propiedades similares</h2>
          <div className={styles.recommendationsList}>
            {recommendations.slice(0, 3).map((recommendation) => (
              <div 
                key={recommendation.property.id}
                className={styles.recommendationCard}
                onClick={() => onPropertyClick(recommendation.property)}
              >
                <Image
                  src={recommendation.property.imagen}
                  alt={recommendation.property.titulo}
                  width={200}
                  height={150}
                  className={styles.recommendationImage}
                  unoptimized
                />
                <div className={styles.recommendationInfo}>
                  <h4>{recommendation.property.titulo}</h4>
                  <p>{recommendation.property.ciudad}</p>
                  <p className={styles.recommendationPrice}>
                    {formatPrice(recommendation.property.precio)}
                  </p>
                  <div className={styles.similarityScore}>
                    <span>{Math.round(recommendation.similarityScore * 100)}% similar</span>
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail; 