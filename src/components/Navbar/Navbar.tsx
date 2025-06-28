/**
 * Componente Navbar - Barra de navegación principal
 */
'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
        <div className={styles.logo} onClick={handleLogoClick}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span className={styles.logoText}>Habita</span>
        </div>

        {/* Navegación desktop */}
        <div className={styles.nav}>
          <a href="#inicio" className={styles.navLink}>
            Inicio
          </a>
          <a href="#propiedades" className={styles.navLink}>
            Propiedades
          </a>
          <a href="#favoritos" className={styles.navLink}>
            Favoritos
            {favoritesCount > 0 && (
              <span className={styles.favoritesBadge}>
                {favoritesCount}
              </span>
            )}
          </a>
          <a href="#contacto" className={styles.navLink}>
            Contacto
          </a>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
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
                    <button className={styles.userAction}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Mi Perfil
                    </button>
                    <button className={styles.userAction}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Configuración
                    </button>
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
          <a href="#inicio" className={styles.mobileNavLink}>
            Inicio
          </a>
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
          <a href="#contacto" className={styles.mobileNavLink}>
            Contacto
          </a>
          
          {/* Información del usuario en móvil */}
          {session?.user && (
            <>
              <div className={styles.mobileUserInfo}>
                <p className={styles.mobileUserName}>{session.user.name}</p>
                <p className={styles.mobileUserEmail}>{session.user.email}</p>
              </div>
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