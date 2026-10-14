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

  // Las páginas son públicas salvo las que muestran datos de la cuenta
  const isProtected = useMemo(
    () => ['/profile'].some(route => pathname?.startsWith(route)),
    [pathname]
  );

  useEffect(() => {
    if (status === 'loading') return; // Esperar a que se cargue la sesión

    // Si no hay sesión y no estamos en una ruta pública, redirigir al login
    if (session === null && isProtected) {
      router.push('/auth/signin');
    }
  }, [session, status, router, isProtected]);

  // Las páginas públicas se muestran sin esperar la sesión
  if (!isProtected) {
    return <>{children}</>;
  }

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

  // Si no hay sesión y no estamos en una ruta pública, no renderizar nada (se redirigirá)
  if (!session) {
    return null;
  }

  // Si hay sesión, mostrar el contenido protegido
  return <>{children}</>;
} 