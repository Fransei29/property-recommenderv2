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

  if (isAuthPage) {
    return <>{children}</>;
  }

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