import { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { styles } from './AuthGuard.module';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();

  useEffect(() => {
    // Verificar auth inmediatamente
    checkAuth();
  }, [segments]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);

      // Navegar directamente
      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuth && !inAuthGroup) {
        // Redirigir a login si no está autenticado y no está en auth
        router.replace('/(auth)/login');
      } else if (isAuth && inAuthGroup) {
        // Redirigir a home si está autenticado y está en auth
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    }
  };

  // Mostrar loading mientras se verifica el auth
  // No esperar navigationState para evitar carga infinita
  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return <>{children}</>;
}


