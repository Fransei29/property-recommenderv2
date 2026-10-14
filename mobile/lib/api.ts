/**
 * API client for backend communication (React Native version)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired, clearExpiredToken } from '@/utils/tokenUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export type PropertyType = 'Casa' | 'Departamento' | 'Condominio' | 'Casa adosada' | 'Terreno';

export interface Property {
  id: number;
  titulo: string;
  ciudad: string;
  tipo: PropertyType | string;
  precio: number;
  ambientes: number;
  metros_cuadrados: number;
  imagen?: string;
  descripcion?: string;
  operacion?: 'venta' | 'alquiler';
  banos?: number;
  ano_construccion?: number;
  caracteristicas?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  tenant_slug?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
  tenant_slug?: string;
}

// Helper function to get auth token from AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to set auth token
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Helper function to remove auth token
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('tenant_slug');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Helper para obtener tenant slug del token o AsyncStorage
const getTenantSlugFromToken = async (): Promise<string | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Si el token tiene tenant_slug, usarlo directamente
    if (payload.tenant_slug) {
      return payload.tenant_slug;
    }
    // Si no, intentar obtenerlo de AsyncStorage (se guarda en el login)
    return await AsyncStorage.getItem('tenant_slug');
  } catch {
    return null;
  }
};

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  // Verificar si el token está expirado antes de hacer la petición
  if (token && isTokenExpired(token)) {
    await clearExpiredToken();
    throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    
    // Agregar X-Tenant-Slug si está disponible y no está ya en los headers
    const tenantSlug = await getTenantSlugFromToken();
    if (tenantSlug && !headers['X-Tenant-Slug']) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    if (response.status === 401) {
      await clearExpiredToken();
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<User> => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Agregar X-Tenant-Slug si se proporciona
    if (data.tenant_slug) {
      headers['X-Tenant-Slug'] = data.tenant_slug;
    }

    const response = await apiFetch('/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
    
    if (response.access_token) {
      await setAuthToken(response.access_token);
      
      // Guardar tenant_slug si viene en la respuesta
      if (response.tenant_slug || data.tenant_slug) {
        await AsyncStorage.setItem('tenant_slug', response.tenant_slug || data.tenant_slug!);
      }
    }
    
    return response;
  },

  logout: async () => {
    await removeAuthToken();
  },
};

// Properties API
export const propertiesAPI = {
  getAll: async (): Promise<Property[]> => {
    return apiFetch('/properties');
  },

  // Para admin: obtener todas las propiedades de todos los tenants
  getAllForAdmin: async (page: number = 1, limit: number = 100): Promise<Property[]> => {
    const response = await apiFetch(`/admin/properties?page=${page}&limit=${limit}`);
    return response.properties || [];
  },

  getById: async (id: number): Promise<Property> => {
    return apiFetch(`/properties/${id}`);
  },
};

// Favorites API
export const favoritesAPI = {
  getAll: async (): Promise<{ favorites: { propertyIds: number[] } }> => {
    return apiFetch('/favorites');
  },

  add: async (propertyId: number): Promise<void> => {
    return apiFetch('/favorites', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    });
  },

  remove: async (propertyId: number): Promise<void> => {
    return apiFetch(`/favorites/${propertyId}`, {
      method: 'DELETE',
    });
  },
};

// Reviews API
export interface Review {
  id: number;
  property_id?: number;
  tenant_id?: number;
  user_id: number;
  username: string;
  rating: number;
  comment?: string;
  photos?: string[];
  created_at: string;
  is_verified?: boolean;
}

export interface ReviewStats {
  avg_rating: string;
  total_reviews: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

export const reviewsAPI = {
  getPropertyReviews: async (propertyId: number, page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
    const tenantSlug = await getTenantSlugFromToken();
    const headers: Record<string, string> = {};
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    return apiFetch(`/reviews/properties/${propertyId}?page=${page}&limit=${limit}`, { headers });
  },

  createPropertyReview: async (propertyId: number, rating: number, comment?: string, photos?: string[]): Promise<Review> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para dejar una review');
    }

    const tenantSlug = await getTenantSlugFromToken();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

    // Para React Native, usamos FormData para enviar fotos si las hay
    const formData = new FormData();
    formData.append('rating', rating.toString());
    if (comment) {
      formData.append('comment', comment);
    }
    // Nota: En React Native, las fotos se manejan diferente que en web
    // Por ahora, solo soportamos comentarios sin fotos
    // TODO: Implementar subida de fotos con expo-image-picker

    const response = await fetch(`${API_URL}/reviews/properties/${propertyId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getTenantReviews: async (tenantId: number, page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
    return apiFetch(`/reviews/tenants/${tenantId}?page=${page}&limit=${limit}`);
  },

  createTenantReview: async (tenantId: number, rating: number, comment?: string): Promise<Review> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para dejar una review');
    }

    const tenantSlug = await getTenantSlugFromToken();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

    const response = await fetch(`${API_URL}/reviews/tenants/${tenantId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rating, comment }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Tenant API
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  phone?: string;
  website?: string;
  address?: string;
  office_hours?: string;
  featured_image?: string;
  history?: string;
  services?: string[] | string;
  team_info?: string;
  mission?: string;
  vision?: string;
  values?: string[] | string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface TenantStats {
  total_properties: number;
  total_cities?: number;
  properties_by_type?: Array<{ tipo: string; count: number }>;
  min_price?: number | null;
  max_price?: number | null;
  avg_price: number | null;
  top_cities?: Array<{ ciudad: string; count: number }>;
}

export interface TenantInfo {
  tenant: Tenant;
  stats: TenantStats;
  properties: Property[];
}

export const tenantAPI = {
  getInfo: async (slug: string): Promise<TenantInfo> => {
    const headers: Record<string, string> = {};
    const tenantSlug = await getTenantSlugFromToken();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    // Usar /info para obtener tenant completo con propiedades y stats
    return apiFetch(`/tenants/${slug}/info`, { headers });
  },
};

