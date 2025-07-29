'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas que no requieren autenticación
  const publicRoutes = useMemo(() => ['/auth/signin', '/auth/signup'], []);

  useEffect(() => {
    if (status === 'loading') return; // Esperar a que se cargue la sesión

    // Si no hay sesión y no estamos en una ruta pública, redirigir al login
    if (session === null && !publicRoutes.includes(pathname)) {
      router.push('/auth/signin');
    }
  }, [session, status, router, pathname, publicRoutes]);

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--primary-color)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{
            animation: 'spin 1s linear infinite',
            transformOrigin: 'center'
          }}>
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si estamos en una ruta pública, mostrar el contenido sin verificar sesión
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Si no hay sesión y no estamos en una ruta pública, no renderizar nada (se redirigirá)
  if (!session) {
    return null;
  }

  // Si hay sesión, mostrar el contenido protegido
  return <>{children}</>;
} 