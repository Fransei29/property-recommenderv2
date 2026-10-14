'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

interface ProvidersProps {
  children: React.ReactNode;
}

// Mantiene el token del backend en localStorage, que es de donde lo lee lib/api.ts
function TokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
    if (accessToken) {
      localStorage.setItem('auth_token', accessToken);
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('auth_token');
    }
  }, [session, status]);

  return null;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}
