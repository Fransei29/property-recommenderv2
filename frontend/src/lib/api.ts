/**
 * API client for backend communication
 */

import { isTokenExpired, clearExpiredToken } from '../utils/tokenUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type PropertyType = 'Casa' | 'Departamento' | 'Condominio' | 'Casa adosada' | 'Terreno';

export type Moneda = 'USD' | 'ARS';

export interface PropertyImage {
  id: number;
  url: string;
}

export interface Property {
  id: number;
  tenant_id?: number;
  titulo: string;
  ciudad: string;
  tipo: PropertyType | string; // Permitir string para flexibilidad con la API
  precio: number;
  ambientes: number;
  metros_cuadrados: number;
  imagen?: string;
  descripcion?: string;
  operacion?: 'venta' | 'alquiler';
  moneda?: Moneda;
  imagenes?: PropertyImage[];
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
}

// Helper function to get auth token from session
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Helper function to remove auth token
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Helper para obtener tenant slug del token
const getTenantSlugFromToken = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Si el token tiene tenant_slug, usarlo directamente
    if (payload.tenant_slug) {
      return payload.tenant_slug;
    }
    // Si no, intentar obtenerlo de localStorage (se guarda en el login)
    return localStorage.getItem('tenant_slug');
  } catch {
    return null;
  }
};

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Verificar si el token está expirado antes de hacer la petición
  if (token && isTokenExpired(token)) {
    clearExpiredToken();
    throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    
    // Agregar X-Tenant-Slug si está disponible y no está ya en los headers
    const tenantSlug = getTenantSlugFromToken();
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
      clearExpiredToken();
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: RegisterData, tenantSlug?: string): Promise<User> => {
    return apiFetch('/auth/register', {
      method: 'POST',
      headers: tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {},
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.access_token) {
      setAuthToken(response.access_token);
    }
    return response;
  },

  logout: () => {
    removeAuthToken();
  },
};

// Properties API
export const propertiesAPI = {
  getAll: async (): Promise<Property[]> => {
    return apiFetch('/properties');
  },

  getById: async (id: number): Promise<Property> => {
    return apiFetch(`/properties/${id}`);
  },

  create: async (property: Omit<Property, 'id' | 'imagenes' | 'imagen'> & { imagen?: string | File; operacion?: string; nuevasImagenes?: File[] }): Promise<Property> => {
    const formData = new FormData();
    formData.append('titulo', property.titulo);
    formData.append('ciudad', property.ciudad);
    formData.append('tipo', property.tipo);
    if (property.operacion) {
      formData.append('operacion', property.operacion);
    }
    if (property.moneda) {
      formData.append('moneda', property.moneda);
    }
    property.nuevasImagenes?.forEach(file => formData.append('imagenes', file));
    formData.append('precio', property.precio.toString());
    formData.append('ambientes', property.ambientes.toString());
    formData.append('metros_cuadrados', property.metros_cuadrados.toString());
    if (property.descripcion) {
      formData.append('descripcion', property.descripcion);
    }
    if (property.imagen) {
      const imagen = property.imagen;
      if (typeof imagen === 'string') {
        formData.append('imagen', imagen);
      } else {
        // TypeScript infers this is File when not string
        formData.append('imagen', imagen as File);
      }
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    const tenantSlug = getTenantSlugFromToken();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    // No set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(`${API_URL}/admin/properties`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('auth_token');
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  update: async (id: number, property: Omit<Partial<Property>, 'imagenes' | 'imagen'> & { imagen?: string | File; operacion?: string; nuevasImagenes?: File[] }): Promise<Property> => {
    const formData = new FormData();
    if (property.moneda) formData.append('moneda', property.moneda);
    property.nuevasImagenes?.forEach(file => formData.append('imagenes', file));
    if (property.titulo) formData.append('titulo', property.titulo);
    if (property.ciudad) formData.append('ciudad', property.ciudad);
    if (property.tipo) formData.append('tipo', property.tipo);
    if (property.operacion) formData.append('operacion', property.operacion);
    if (property.precio !== undefined) formData.append('precio', property.precio.toString());
    if (property.ambientes !== undefined) formData.append('ambientes', property.ambientes.toString());
    if (property.metros_cuadrados !== undefined) formData.append('metros_cuadrados', property.metros_cuadrados.toString());
    if (property.descripcion) formData.append('descripcion', property.descripcion);
    if (property.imagen) {
      const imagen = property.imagen;
      if (typeof imagen === 'string') {
        formData.append('imagen', imagen);
      } else {
        // TypeScript infers this is File when not string
        formData.append('imagen', imagen as File);
      }
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    
    // Agregar X-Tenant-Slug si está disponible
    const tenantSlug = getTenantSlugFromToken();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    
    // No set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(`${API_URL}/admin/properties/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('auth_token');
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    const tenantSlug = getTenantSlugFromToken();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

    const response = await fetch(`${API_URL}/admin/properties/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
  },
};

// Registra una consulta (clic en WhatsApp, etc.). No bloquea al usuario si falla.
export const registerContact = (propertyId: number, contactType: 'whatsapp' | 'phone' | 'email' = 'whatsapp') => {
  const token = getAuthToken();
  fetch(`${API_URL}/properties/${propertyId}/contact`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ contact_type: contactType }),
  }).catch((error) => console.error('Error registrando consulta:', error));
};

// Admin API
export const adminAPI = {
  deleteImage: async (propertyId: number, imageId: number): Promise<void> => {
    await apiFetch(`/admin/properties/${propertyId}/images/${imageId}`, { method: 'DELETE' });
  },

  getStats: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    return apiFetch('/admin/stats');
  },

  getProperties: async (page: number = 1, limit: number = 20) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    return apiFetch(`/admin/properties?page=${page}&limit=${limit}`);
  },
};

// Tenant API
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  email?: string;
  description?: string;
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
  office_hours?: string;
  featured_image?: string;
  gallery?: string[];
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
}

export interface PublicTenant {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  address?: string | null;
  primary_color?: string | null;
  total_properties: number;
}

export interface TenantInfo {
  tenant: Tenant;
  properties: Property[];
  stats: {
    total_properties: number;
    total_cities: number;
    min_price: number | null;
    max_price: number | null;
    avg_price: number | null;
  };
}

export const tenantAPI = {
  getPublicList: async (): Promise<PublicTenant[]> => {
    return apiFetch('/tenants/public');
  },

  getBySlug: async (slug: string): Promise<Tenant> => {
    return apiFetch(`/tenants/${slug}`);
  },

  getInfo: async (slug: string): Promise<TenantInfo> => {
    // El endpoint /tenants/:slug/info no requiere X-Tenant-Slug porque el slug ya está en la URL
    return apiFetch(`/tenants/${slug}/info`);
  },

  getCurrent: async (): Promise<Tenant> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    // Obtener tenant_slug del token
    const tenantSlug = getTenantSlugFromToken();
    if (!tenantSlug) {
      throw new Error('No se pudo determinar el tenant actual');
    }
    return apiFetch(`/tenants/${tenantSlug}`);
  },

  update: async (tenantData: Omit<Partial<Tenant>, 'featured_image'> & { logo?: File; featured_image?: File | string }): Promise<Tenant> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const formData = new FormData();
    
    // Agregar campos de texto
    if (tenantData.name) formData.append('name', tenantData.name);
    if (tenantData.email) formData.append('email', tenantData.email);
    if (tenantData.phone) formData.append('phone', tenantData.phone);
    if (tenantData.whatsapp !== undefined) formData.append('whatsapp', tenantData.whatsapp);
    if (tenantData.address) formData.append('address', tenantData.address);
    if (tenantData.description) formData.append('description', tenantData.description);
    if (tenantData.history) formData.append('history', tenantData.history);
    if (tenantData.mission) formData.append('mission', tenantData.mission);
    if (tenantData.vision) formData.append('vision', tenantData.vision);
    if (tenantData.team_info) formData.append('team_info', tenantData.team_info);
    if (tenantData.office_hours) formData.append('office_hours', tenantData.office_hours);
    if (tenantData.logo_url) formData.append('logo_url', tenantData.logo_url);
    if (tenantData.featured_image && typeof tenantData.featured_image === 'string') {
      formData.append('featured_image', tenantData.featured_image);
    }
    
    // Agregar archivos si existen
    if (tenantData.logo && tenantData.logo instanceof File) {
      formData.append('logo', tenantData.logo);
    }
    if (tenantData.featured_image && tenantData.featured_image instanceof File) {
      formData.append('featured_image', tenantData.featured_image);
    }
    
    // Agregar arrays/objetos como JSON strings
    if (tenantData.services) {
      const services = Array.isArray(tenantData.services) 
        ? JSON.stringify(tenantData.services) 
        : tenantData.services;
      formData.append('services', services);
    }
    if (tenantData.values) {
      const values = Array.isArray(tenantData.values) 
        ? JSON.stringify(tenantData.values) 
        : tenantData.values;
      formData.append('values', values);
    }
    if (tenantData.social_media) {
      formData.append('social_media', JSON.stringify(tenantData.social_media));
    }
    if (tenantData.gallery) {
      formData.append('gallery', JSON.stringify(tenantData.gallery));
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Agregar X-Tenant-Slug si está disponible
    const tenantSlug = getTenantSlugFromToken();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    
    // No establecer Content-Type para FormData, el navegador lo hará automáticamente con el boundary

    const response = await fetch(`${API_URL}/tenants/me`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Reviews API
export interface Review {
  id: number;
  rating: number;
  comment?: string;
  is_verified: boolean;
  username: string;
  photos?: string[];
  created_at: string;
}

export interface ReviewStats {
  avg_rating: string | null;
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
  getPropertyReviews: async (propertyId: number, page: number = 1, limit: number = 10, tenantSlug?: string): Promise<ReviewsResponse> => {
    const headers: Record<string, string> = {};
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    return apiFetch(`/reviews/properties/${propertyId}?page=${page}&limit=${limit}`, { headers });
  },

  createPropertyReview: async (propertyId: number, rating: number, comment?: string, photos?: File[], tenantSlug?: string): Promise<Review> => {
    const formData = new FormData();
    formData.append('rating', rating.toString());
    if (comment) {
      formData.append('comment', comment);
    }
    if (photos) {
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para dejar una review');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

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

  createTenantReview: async (tenantId: number, rating: number, comment?: string, tenantSlug?: string): Promise<Review> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para dejar una review');
    }

    const headers: HeadersInit = {
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

