/**
 * Página de Contacto
 */

'use client';

import React from 'react';
import Link from 'next/link';
import ContactForm from '../../components/ContactForm/ContactForm';
import styles from './page.module.scss';

export default function ContactPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Contacto
          </h1>
          <p className={styles.subtitle}>
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Información de contacto */}
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3>Email</h3>
                <p>info@habita.com</p>
                <p>soporte@habita.com</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3>Teléfono</h3>
                <p>+54 11 1234-5678</p>
                <p>Lun - Vie: 9:00 - 18:00</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3>Oficina</h3>
                <p>Av. Corrientes 1234</p>
                <p>Buenos Aires, Argentina</p>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className={styles.formSection}>
            <ContactForm />
          </div>

          {/* Botón de volver */}
          <div className={styles.backButtonContainer}>
            <Link href="/" className={styles.backToHomeButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver al Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 