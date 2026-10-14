'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './AdminNavbar.module.scss';

interface AdminNavbarProps {
  userName?: string;
  userEmail?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  userName,
  userEmail
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span className={styles.logoText}>Panel Administración</span>
        </div>

        {/* Navegación admin */}
        <div className={styles.nav}>
          <button 
            onClick={() => router.push('/admin')}
            className={styles.navLink}
          >
            Propiedades
          </button>
        </div>

        {/* Menú de usuario */}
        <div className={styles.actions}>
          <div className={styles.userMenu}>
            <button
              onClick={toggleUserMenu}
              className={styles.userButton}
              aria-label="Menú de usuario"
            >
              <div className={styles.userAvatar}>
                <Image 
                  src="/avatar.avif" 
                  alt="Avatar del administrador" 
                  className={styles.avatarImage}
                  width={32}
                  height={32}
                />
              </div>
              <span className={styles.userName}>{userName || 'Admin'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.userInfo}>
                  <p className={styles.userEmail}>{userEmail || 'admin@example.com'}</p>
                  <p className={styles.userRole}>Administrador</p>
                </div>
                <div className={styles.userActions}>
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
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;


