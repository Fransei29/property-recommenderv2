'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TenantSelect } from '@/components/TenantSelect/TenantSelect';
import styles from '../auth.module.scss';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSlug: ''
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        tenant_slug: formData.tenantSlug,
        redirect: false,
      });

      if (result?.error) {
        alert('Error al iniciar sesión. Verifica tus credenciales.');
      } else {
        // Los callbacks de NextAuth corren en el servidor: copiar el token de la sesión al navegador
        const session = await getSession();
        const token = (session?.user as { accessToken?: string } | undefined)?.accessToken || null;
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('tenant_slug', formData.tenantSlug);
        }
        if (!token) {
          console.warn('Token no encontrado en localStorage después del login');
        }
        
        // Redirigir según el rol del usuario
        router.refresh();
        setTimeout(() => {
          // Intentar obtener el rol del token en localStorage
          let userRole = null;
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userRole = payload.role;
            } catch (e) {
              console.error('Error decodificando token:', e);
            }
          }
          
          // Redirigir a /admin si el rol es 'admin' o 'tenant_admin'
          if (userRole === 'admin' || userRole === 'tenant_admin') {
            router.push('/admin');
          } else {
            // Usuario normal - ir al sitio de su inmobiliaria
            router.push(`/inmobiliaria/${formData.tenantSlug}`);
          }
        }, 300);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      alert('Error: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Lado izquierdo - Imagen de marca */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>Habita</span>
          </div>
          
          <h1>Tu próximo hogar, más cerca.</h1>
          <p>
            Descubre propiedades únicas con nuestro sistema inteligente de recomendaciones. 
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
              <span>Recomendaciones inteligentes</span>
            </div>
            <div className={styles.feature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Propiedades verificadas</span>
            </div>
            <div className={styles.feature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Búsqueda segura y confiable</span>
            </div>
            <div className={styles.feature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>Favoritos personalizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span>Habita</span>
            </div>
            <h1>Iniciar Sesión</h1>
            <p>Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="tenant">Inmobiliaria</label>
              <TenantSelect
                value={formData.tenantSlug}
                onChange={(tenantSlug) => setFormData((prev) => ({ ...prev, tenantSlug }))}
                includeGlobalAdmin
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/signup" className={styles.link}>
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className={styles.demo}>
            <h3>Credenciales de demostración:</h3>
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Contraseña:</strong> password</p>
          </div>
        </div>
      </div>
    </div>
  );
} 