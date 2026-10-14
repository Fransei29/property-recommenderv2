/**
 * Tipos TypeScript para el sistema de recomendación de propiedades
 */

// Re-exportar Property desde api.ts para mantener compatibilidad
import type { Property } from '../lib/api';
export type { Property } from '../lib/api';
export type { PropertyType } from '../lib/api';

// Tipos de propiedades disponibles (adaptado al JSON real)
export type PropertyTypeEnum = 'Casa' | 'Departamento' | 'Condominio' | 'Casa adosada' | 'Terreno';

// Filtros para el listado de propiedades
export interface PropertyFilters {
  operacion?: 'venta' | 'alquiler';
  ciudad?: string;
  tipo?: PropertyTypeEnum;
  precioMin?: number;
  precioMax?: number;
  searchQuery?: string;
}

// Estado de los favoritos
export interface FavoritesState {
  propertyIds: number[];
}

// Configuración de paginación
export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Resultado de recomendaciones
export interface RecommendationResult {
  property: Property;
  similarityScore: number;
  reasons: string[];
}

// Estado del componente de propiedades
export interface PropertiesState {
  properties: Property[];
  filteredProperties: Property[];
  selectedProperty: Property | null;
  recommendations: RecommendationResult[];
  filters: PropertyFilters;
  pagination: PaginationConfig;
  loading: boolean;
  error: string | null;
}

// Props para componentes
export interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: number) => void;
  onClick: (property: Property) => void;
  className?: string;
}

export interface RecommendationListProps {
  recommendations: RecommendationResult[];
  onPropertyClick: (property: Property) => void;
  className?: string;
}

export interface FiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters?: () => void;
  ciudades: string[];
  tiposPropiedad: PropertyTypeEnum[];
  className?: string;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
} 