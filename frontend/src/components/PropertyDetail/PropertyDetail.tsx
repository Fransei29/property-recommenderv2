'use client';

/**
 * Componente PropertyDetail - Vista detallada de una propiedad
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Property, RecommendationResult } from '../../types/types';
import { Tenant, registerContact } from '@/lib/api';
import { formatPropertyPrice, getOperacionLabel, getPropertyTypeLabel, resolveImageUrl } from '../../utils';
import styles from './PropertyDetail.module.scss';

const buildWhatsAppUrl = (tenant: Tenant, property: Property) => {
  const number = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
  if (!number) return null;
  const link = typeof window !== 'undefined' ? window.location.href : '';
  const message = `Hola ${tenant.name}! Me interesa la propiedad "${property.titulo}" (${property.ciudad}). ${link}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

interface PropertyDetailProps {
  property: Property;
  recommendations: RecommendationResult[];
  onPropertyClick: (property: Property) => void;
  onBackClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: number) => void;
  tenant?: Tenant;
  className?: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  recommendations,
  onPropertyClick,
  onBackClick,
  isFavorite,
  onToggleFavorite,
  tenant,
  className = ''
}) => {
  const photos = [property.imagen, ...(property.imagenes || []).map(image => image.url)].filter(
    (url): url is string => Boolean(url)
  );
  const [activePhoto, setActivePhoto] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const whatsAppUrl = tenant ? buildWhatsAppUrl(tenant, property) : null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('No se pudo copiar el link:', error);
    }
  };

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
        {/* Galería de fotos */}
        <div className={styles.gallery}>
        <div className={styles.imageSection}>
          <Image
            src={resolveImageUrl(photos[activePhoto])}
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

        {photos.length > 1 && (
          <div className={styles.thumbnails}>
            {photos.map((url, index) => (
              <button
                key={`${url}-${index}`}
                onClick={() => setActivePhoto(index)}
                className={`${styles.thumbnail} ${index === activePhoto ? styles.thumbnailActive : ''}`}
                aria-label={`Ver foto ${index + 1}`}
              >
                <Image src={resolveImageUrl(url)} alt="" width={120} height={80} unoptimized />
              </button>
            ))}
          </div>
        )}
        </div>

        {/* Información de la propiedad */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1 className={styles.title}>{property.titulo}</h1>
            <p className={styles.location}>{property.ciudad}</p>
            <div className={styles.badges}>
              <span className={styles.typeBadge}>
                {getPropertyTypeLabel(property.tipo)}
              </span>
              <span className={`${styles.operacionBadge} ${property.operacion === 'alquiler' ? styles.alquiler : ''}`}>
                {getOperacionLabel(property.operacion)}
              </span>
            </div>
          </div>

          <div className={styles.price}>
            <span className={styles.priceAmount}>
              {formatPropertyPrice(property)}
            </span>
          </div>

          {/* Contacto */}
          <div className={styles.contactBox}>
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
                onClick={() => registerContact(property.id, 'whatsapp')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.42 9.42 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.97 1.52 5.7L.55 23.63l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.05z"/>
                </svg>
                Consultar por WhatsApp
              </a>
            )}
            <button onClick={handleCopyLink} className={styles.shareButton}>
              {linkCopied ? '¡Link copiado!' : 'Copiar link para compartir'}
            </button>
            {tenant && (
              <p className={styles.publishedBy}>Publicado por <strong>{tenant.name}</strong></p>
            )}
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
                  src={resolveImageUrl(recommendation.property.imagen)}
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
                    {formatPropertyPrice(recommendation.property)}
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