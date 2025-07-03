/**
 * Componente PropertyCard - Tarjeta individual de propiedad
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyCardProps } from '../../types/types';
import { formatPrice, getPropertyTypeLabel } from '../../utils';
import styles from './PropertyCard.module.scss';

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  onClick,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(property.id);
  };

  const handleCardClick = () => {
    onClick(property);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`${styles.card} ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Imagen de la propiedad */}
      <div className={styles.imageContainer}>
        {!imageError ? (
          <Image 
            src={property.imagen} 
            alt={property.titulo}
            width={400}
            height={300}
            className={styles.image}
            priority
            onError={handleImageError}
            unoptimized
          />
        ) : (
          <div className={styles.imageFallback}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span className={styles.fallbackText}>
              {property.tipo} en {property.ciudad}
            </span>
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className={styles.typeBadge}>
          {getPropertyTypeLabel(property.tipo)}
        </div>
        
        {/* Botón de favorito */}
        <button
          className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Contenido de la tarjeta */}
      <div className={styles.content}>
        {/* Título y ciudad */}
        <div className={styles.header}>
          <h3 className={styles.title}>{property.titulo}</h3>
          <p className={styles.city}>{property.ciudad}</p>
        </div>

        {/* Precio */}
        <div className={styles.price}>
          <span className={styles.priceAmount}>
            {formatPrice(property.precio)}
          </span>
        </div>

        {/* Detalles */}
        <div className={styles.details}>
          <div className={styles.detail}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>{property.ambientes} ambientes</span>
          </div>
          
          <div className={styles.detail}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
            <span>{property.metros_cuadrados}m²</span>
          </div>
        </div>

        {/* Descripción */}
        {property.descripcion && (
          <p className={styles.description}>
            {property.descripcion.length > 100 
              ? `${property.descripcion.substring(0, 100)}...` 
              : property.descripcion
            }
          </p>
        )}

        {/* Características destacadas */}
        {property.caracteristicas && property.caracteristicas.length > 0 && (
          <div className={styles.features}>
            {property.caracteristicas.slice(0, 3).map((feature, index) => (
              <span key={index} className={styles.feature}>
                {feature}
              </span>
            ))}
            {property.caracteristicas.length > 3 && (
              <span className={styles.featureMore}>
                +{property.caracteristicas.length - 3} más
              </span>
            )}
          </div>
        )}
      </div>

      {/* Indicador de selección */}
      <div className={styles.selectionIndicator} />
    </div>
  );
}; 