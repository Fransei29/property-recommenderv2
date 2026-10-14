'use client';

import React from 'react';
import styles from './TenantStats.module.scss';

interface TenantStatsProps {
  stats: {
    total_properties: number;
    total_cities: number;
    min_price: number | null;
    max_price: number | null;
    avg_price: number | null;
  };
}

export const TenantStats: React.FC<TenantStatsProps> = ({ stats }) => {
  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={styles.tenantStats}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>🏠</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.total_properties}</div>
          <div className={styles.statLabel}>Propiedades</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>📍</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.total_cities}</div>
          <div className={styles.statLabel}>Ciudades</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>💰</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{formatPrice(stats.min_price)}</div>
          <div className={styles.statLabel}>Venta desde</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>💎</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{formatPrice(stats.max_price)}</div>
          <div className={styles.statLabel}>Venta hasta</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{formatPrice(stats.avg_price)}</div>
          <div className={styles.statLabel}>Venta promedio</div>
        </div>
      </div>
    </div>
  );
};






