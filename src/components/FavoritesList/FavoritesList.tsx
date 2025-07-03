/**
 * Componente FavoritesList - Lista de propiedades favoritas
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Property } from '../../types/types';
import { useFavorites } from '../../hooks/useFavorites';
import { getPropertiesWithDescription } from '../../data/loadProperties';
import { formatPrice } from '../../utils';
import styles from './FavoritesList.module.scss';

interface FavoritesListProps {
  className?: string;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  className = ''
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const favorites = useFavorites();

  // Cargar propiedades al inicializar
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const loadedProperties = await getPropertiesWithDescription();
        setProperties(loadedProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Filtrar solo las propiedades favoritas
  const favoriteProperties = properties.filter(property => 
    favorites.isFavorite(property.id)
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              className={styles.spinnerCircle}
            />
          </svg>
          <p>Cargando propiedades favoritas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.favoritesList} ${className}`}>
      {/* Estadísticas */}
      <div className={styles.stats}>
        <span className={styles.statItem}>
          Total de favoritos: {favoriteProperties.length}
        </span>
      </div>

      {/* Contenido de favoritos */}
      {favoriteProperties.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No tienes propiedades favoritas</h3>
          <p className={styles.emptyDescription}>
            Cuando marques propiedades como favoritas, aparecerán aquí para que puedas administrarlas.
          </p>
        </div>
      ) : (
        <div className={styles.favoritesGrid}>
          {favoriteProperties.map((property) => (
            <div key={property.id} className={styles.favoriteCard}>
              {/* Imagen */}
              <div className={styles.imageContainer}>
                <Image 
                  src={property.imagen} 
                  alt={property.titulo}
                  width={300}
                  height={200}
                  className={styles.image}
                  priority
                  unoptimized
                />
                <div className={styles.propertyId}>
                  ID: {property.id}
                </div>
              </div>

              {/* Contenido */}
              <div className={styles.cardContent}>
                <h3 className={styles.propertyTitle}>{property.titulo}</h3>
                <p className={styles.propertyCity}>{property.ciudad}</p>
                <div className={styles.propertyPrice}>
                  {formatPrice(property.precio)}
                </div>
                <div className={styles.propertyDetails}>
                  <span className={styles.detail}>
                    {property.ambientes} ambientes
                  </span>
                  <span className={styles.detail}>
                    {property.metros_cuadrados}m²
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className={styles.cardActions}>
                <button
                  className={styles.removeButton}
                  onClick={() => favorites.toggleFavorite(property.id)}
                  aria-label="Remover de favoritos"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesList; 