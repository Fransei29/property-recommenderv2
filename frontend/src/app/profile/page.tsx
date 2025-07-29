/**
 * Página de Perfil del Usuario - Mis Favoritos
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import FavoritesList from '../../components/FavoritesList/FavoritesList';
import styles from './page.module.scss';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading') {
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
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión, no mostrar nada (AuthGuard se encargará de la redirección)
  if (!session) {
    return null;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Mi Perfil
          </h1>
          <h2 className={styles.subtitle}>
            Mis Propiedades Favoritas
          </h2>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <Image 
                src="/avatar.avif" 
                alt="Avatar del usuario" 
                className={styles.avatarImage}
                width={48}
                height={48}
              />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{session.user?.name}</p>
              <p className={styles.userEmail}>{session.user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Componente de favoritos */}
          <FavoritesList />
        </div>
      </main>

      {/* Botón de volver - Centrado al final */}
      <div className={styles.backButtonContainer}>
        <Link href="/" className={styles.backToHomeButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al Home
        </Link>
      </div>
    </div>
  );
} 