'use client';

import React from 'react';
import { Tenant } from '@/lib/api';
import styles from './TenantHeader.module.scss';
import { resolveImageUrl } from '@/utils';

interface TenantHeaderProps {
  tenant: Tenant;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ tenant }) => {
  return (
    <div className={styles.tenantHeader}>
      {tenant.featured_image && (
        <div className={styles.featuredImage}>
          <img
            src={resolveImageUrl(tenant.featured_image, '')}
            alt={tenant.name}
          />
        </div>
      )}
      
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          {tenant.logo_url ? (
            <img
              src={resolveImageUrl(tenant.logo_url, '')}
              alt={`${tenant.name} logo`}
              className={styles.logo}
            />
          ) : (
            <div className={styles.logoPlaceholder}>
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.tenantName}>{tenant.name}</h1>
          
          {tenant.description && (
            <p className={styles.description}>{tenant.description}</p>
          )}

          <div className={styles.metaInfo}>
            {tenant.phone && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📞</span>
                <span>{tenant.phone}</span>
              </div>
            )}
            {tenant.address && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📍</span>
                <span>{tenant.address}</span>
              </div>
            )}
            {tenant.office_hours && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>🕐</span>
                <span>{tenant.office_hours}</span>
              </div>
            )}
          </div>

          {tenant.social_media && (
            <div className={styles.socialMedia}>
              {tenant.social_media.facebook && (
                <a
                  href={tenant.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Facebook
                </a>
              )}
              {tenant.social_media.instagram && (
                <a
                  href={tenant.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Instagram
                </a>
              )}
              {tenant.social_media.linkedin && (
                <a
                  href={tenant.social_media.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

