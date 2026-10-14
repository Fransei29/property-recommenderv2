/**
 * Token utilities for JWT token management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;
    
    // Convertir exp (segundos) a milisegundos y comparar
    const expirationTime = exp * 1000;
    const currentTime = Date.now();
    
    // Considerar expirado si falta menos de 1 minuto
    return currentTime >= expirationTime - 60000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Si hay error, considerar expirado por seguridad
  }
};

export const clearExpiredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('tenant_slug');
  } catch (error) {
    console.error('Error clearing expired token:', error);
  }
};

export const getTokenPayload = (token: string): any | null => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};




