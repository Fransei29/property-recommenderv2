'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AuthGuard from '../AuthGuard/AuthGuard';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');
  const isAdminPage = pathname?.startsWith('/admin');

  // Páginas de autenticación: sin navbar ni footer
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Páginas de administración: sin navbar público ni footer (tienen su propio navbar)
  if (isAdminPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    );
  }

  // Páginas públicas: con navbar y footer
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>
      <Footer />
    </div>
  );
} 