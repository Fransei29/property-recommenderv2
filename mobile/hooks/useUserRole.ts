import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'tenant_admin' | 'user' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setRole(null);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // El token incluye 'role', no 'role_name'
        const roleName = payload.role || payload.role_name || null;
        
        // Normalizar el rol
        if (roleName === 'admin' || roleName === 'Admin') {
          setRole('admin');
        } else if (roleName === 'tenant_admin' || roleName === 'Tenant Admin') {
          setRole('tenant_admin');
        } else {
          setRole('user');
        }
      } catch {
        setRole(null);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin' || role === 'tenant_admin';
  const isClient = role === 'user';

  return {
    role,
    isAdmin,
    isClient,
    loading,
    refresh: loadRole,
  };
}

