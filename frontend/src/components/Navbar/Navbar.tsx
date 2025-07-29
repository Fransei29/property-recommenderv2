/**
 * Componente Navbar - Barra de navegación principal
 */
'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.scss';

interface NavbarProps {
  favoritesCount?: number;
  onLogoClick?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoritesCount = 0,
  onLogoClick,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <nav className={`${styles.navbar} ${className}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={handleLogoClick}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span className={styles.logoText}>Habita</span>
        </Link>

        {/* Navegación desktop */}
        <div className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Inicio
          </Link>
          <Link href="/contacto" className={styles.navLink}>
            Contacto
          </Link>
        </div>

        {/* Acciones */}
        <div className={styles.actions}>

          {/* Menú de usuario */}
          {session?.user && (
            <div className={styles.userMenu}>
              <button
                onClick={toggleUserMenu}
                className={styles.userButton}
                aria-label="Menú de usuario"
              >
                <div className={styles.userAvatar}>
                  <Image 
                    src="/avatar.avif" 
                    alt="Avatar del usuario" 
                    className={styles.avatarImage}
                    width={32}
                    height={32}
                  />
                </div>
                <span className={styles.userName}>{session.user.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <p className={styles.userEmail}>{session.user.email}</p>
                  </div>
                  <div className={styles.userActions}>
                    <Link href="/profile" className={styles.userAction}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className={`${styles.userAction} ${styles.signOutButton}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón móvil */}
        <button
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileNavLink}>
            Inicio
          </Link>
          <a href="#propiedades" className={styles.mobileNavLink}>
            Propiedades
          </a>
          <a href="#favoritos" className={styles.mobileNavLink}>
            Favoritos
            {favoritesCount > 0 && (
              <span className={styles.mobileFavoritesBadge}>
                {favoritesCount}
              </span>
            )}
          </a>
          <Link href="/contacto" className={styles.mobileNavLink}>
            Contacto
          </Link>
          
          {/* Información del usuario en móvil */}
          {session?.user && (
            <>
              <div className={styles.mobileUserInfo}>
                <p className={styles.mobileUserName}>{session.user.name}</p>
                <p className={styles.mobileUserEmail}>{session.user.email}</p>
              </div>
              <Link href="/profile" className={styles.mobileNavLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Mi Perfil
              </Link>
              <button 
                onClick={handleSignOut}
                className={styles.mobileSignOutButton}
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 