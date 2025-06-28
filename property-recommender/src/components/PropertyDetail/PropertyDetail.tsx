/**
 * Componente PropertyDetail - Vista detallada de una propiedad
 */

import React from 'react';
import { Property, RecommendationResult } from '../../types/types';
import { formatPrice } from '../../utils';
import { RecommendationList } from '../RecommendationList/RecommendationList';
import styles from './PropertyDetail.module.scss';

interface PropertyDetailProps {
  property: Property;
  recommendations: RecommendationResult[];
  onPropertyClick: (property: Property) => void;
  onBackClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: number) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  recommendations,
  onPropertyClick,
  onBackClick,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className={styles.propertyDetail}>
      {/* Botón de volver */}
      <div className={styles.backButtonContainer}>
        <button
          onClick={onBackClick}
          className={styles.backButton}
          aria-label="Volver al listado"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Volver al listado
        </button>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        {/* Imagen principal */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <img
              src={property.imagen}
              alt={property.titulo}
              className={styles.mainImage}
            />
            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Información de la propiedad */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1 className={styles.title}>{property.titulo}</h1>
            <div className={styles.price}>{formatPrice(property.precio)}</div>
          </div>

          <div className={styles.location}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{property.ciudad}</span>
          </div>

          <div className={styles.specs}>
            <div className={styles.spec}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span>{property.tipo}</span>
            </div>
            <div className={styles.spec}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="9" y2="9"/>
                <line x1="15" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="9" y2="15"/>
                <line x1="15" y1="15" x2="15" y2="15"/>
              </svg>
              <span>{property.ambientes} ambientes</span>
            </div>
            <div className={styles.spec}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>{property.metros_cuadrados}m²</span>
            </div>
          </div>

          {property.descripcion && (
            <div className={styles.description}>
              <h3>Descripción</h3>
              <p>{property.descripcion}</p>
            </div>
          )}

          {/* Características adicionales si existen */}
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
        <div className={styles.recommendationsSection}>
          <h2 className={styles.recommendationsTitle}>
            Propiedades similares
          </h2>
          <RecommendationList
            recommendations={recommendations}
            onPropertyClick={onPropertyClick}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetail; 