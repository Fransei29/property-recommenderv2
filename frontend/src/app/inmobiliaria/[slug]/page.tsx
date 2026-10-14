'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tenantAPI, TenantInfo as TenantInfoType, Property } from '@/lib/api';
import { TenantHeader } from '@/components/TenantHeader/TenantHeader';
import { TenantInfo } from '@/components/TenantInfo/TenantInfo';
import { TenantStats } from '@/components/TenantStats/TenantStats';
import { PropertyBrowser } from '@/components/PropertyBrowser/PropertyBrowser';
import { TenantReviews } from '@/components/TenantReviews/TenantReviews';
import styles from './page.module.scss';

export default function InmobiliariaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [tenantInfo, setTenantInfo] = useState<TenantInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenantInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        setTenantInfo(await tenantAPI.getInfo(slug));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar información');
        console.error('Error loading tenant info:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTenantInfo();
  }, [slug]);

  const handlePropertyClick = (property: Property) => {
    router.push(`/inmobiliaria/${slug}/propiedad/${property.id}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Cargando información de la inmobiliaria...</div>
      </div>
    );
  }

  if (error || !tenantInfo) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error || 'Inmobiliaria no encontrada'}</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inmobiliariaPage}>
      <TenantHeader tenant={tenantInfo.tenant} />

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <TenantStats stats={tenantInfo.stats} />

          <PropertyBrowser properties={tenantInfo.properties} onPropertyClick={handlePropertyClick} />

          <TenantInfo tenant={tenantInfo.tenant} />

          <TenantReviews
            tenantId={tenantInfo.tenant.id}
            tenantName={tenantInfo.tenant.name}
          />
        </div>
      </div>
    </div>
  );
}
