'use client';

import React from 'react';
import { Tenant } from '@/lib/api';
import styles from './TenantInfo.module.scss';

interface TenantInfoProps {
  tenant: Tenant;
}

export const TenantInfo: React.FC<TenantInfoProps> = ({ tenant }) => {
  const services: string[] = Array.isArray(tenant.services)
    ? tenant.services
    : typeof tenant.services === 'string'
    ? JSON.parse(tenant.services || '[]')
    : [];

  const values: string[] = Array.isArray(tenant.values)
    ? tenant.values
    : typeof tenant.values === 'string'
    ? JSON.parse(tenant.values || '[]')
    : [];

  return (
    <div className={styles.tenantInfo}>
      {tenant.history && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
          <p className={styles.sectionContent}>{tenant.history}</p>
        </section>
      )}

      {tenant.mission && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Misión</h2>
          <p className={styles.sectionContent}>{tenant.mission}</p>
        </section>
      )}

      {tenant.vision && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Visión</h2>
          <p className={styles.sectionContent}>{tenant.vision}</p>
        </section>
      )}

      {values.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
          <ul className={styles.valuesList}>
            {values.map((value, index) => (
              <li key={index} className={styles.valueItem}>
                {value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {services.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Servicios</h2>
          <ul className={styles.servicesList}>
            {services.map((service, index) => (
              <li key={index} className={styles.serviceItem}>
                {service}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tenant.team_info && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Nuestro Equipo</h2>
          <p className={styles.sectionContent}>{tenant.team_info}</p>
        </section>
      )}
    </div>
  );
};






