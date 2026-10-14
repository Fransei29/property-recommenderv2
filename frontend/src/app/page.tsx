'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { tenantAPI, PublicTenant } from '@/lib/api';
import { resolveImageUrl } from '@/utils';
import styles from './page.module.scss';

export default function HomePage() {
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tenantAPI.getPublicList()
      .then(setTenants)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar inmobiliarias'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Bienvenido a Habita</h1>
          <h2 className={styles.subtitle}>
            Encuentra tu próximo hogar en las inmobiliarias de tu ciudad.
          </h2>
        </div>
      </header>

      <main className={styles.directory}>
        <h2 className={styles.directoryTitle}>Inmobiliarias</h2>

        {loading && <p className={styles.directoryMessage}>Cargando inmobiliarias...</p>}
        {error && <p className={styles.directoryMessage}>{error}</p>}

        <div className={styles.tenantGrid}>
          {tenants.map((tenant) => (
            <Link key={tenant.id} href={`/inmobiliaria/${tenant.slug}`} className={styles.tenantCard}>
              {tenant.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(tenant.logo_url, '')} alt={tenant.name} className={styles.tenantLogo} />
              ) : (
                <div
                  className={styles.tenantLogoPlaceholder}
                  style={{ background: tenant.primary_color || '#2563eb' }}
                >
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.tenantInfo}>
                <h3>{tenant.name}</h3>
                {tenant.description && <p>{tenant.description}</p>}
                {tenant.address && <p className={styles.tenantAddress}>📍 {tenant.address}</p>}
                <span className={styles.tenantCount}>
                  {tenant.total_properties} {tenant.total_properties === 1 ? 'propiedad' : 'propiedades'} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
