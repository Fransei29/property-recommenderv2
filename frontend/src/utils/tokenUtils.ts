/**
 * Utilidades para manejar tokens JWT
 */

interface TokenPayload {
  sub?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp < now : true;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): TokenPayload | null => {
  try {
    return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
  } catch {
    return null;
  }
};

export const clearExpiredToken = (): void => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
    }
  }
};

