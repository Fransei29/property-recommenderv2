/**
 * Utilidades para filtrado de propiedades
 */

import { Property, PropertyType } from '../types/types';
import { flexibleTextSearch } from './searchUtils';

/**
 * Filtra propiedades según criterios específicos
 * @param properties - Lista de propiedades a filtrar
 * @param filters - Criterios de filtrado
 * @returns Propiedades filtradas
 */
export function filterProperties(
  properties: Property[],
  filters: {
    ciudad?: string;
    tipo?: PropertyType;
    precioMin?: number;
    precioMax?: number;
    searchQuery?: string;
  }
): Property[] {
  return properties.filter(property => {
    // Filtro por ciudad (búsqueda flexible)
    if (filters.ciudad && !flexibleTextSearch(property.ciudad, filters.ciudad)) {
      return false;
    }

    // Filtro por tipo
    if (filters.tipo && property.tipo !== filters.tipo) {
      return false;
    }

    // Filtro por precio mínimo
    if (filters.precioMin && property.precio < filters.precioMin) {
      return false;
    }

    // Filtro por precio máximo
    if (filters.precioMax && property.precio > filters.precioMax) {
      return false;
    }

    // Filtro por búsqueda de texto (búsqueda flexible)
    if (filters.searchQuery) {
      const searchableText = [
        property.titulo,
        property.ciudad,
        property.descripcion || '',
        property.tipo
      ].join(' ');

      if (!flexibleTextSearch(searchableText, filters.searchQuery)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Obtiene etiqueta legible para el tipo de propiedad
 * @param type - Tipo de propiedad
 * @returns Etiqueta en español
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  return type; // Ya está en español en el JSON
}

/**
 * Calcula el rango de precios recomendado (±20%)
 * @param basePrice - Precio base
 * @returns Objeto con precio mínimo y máximo
 */
export function getPriceRange(basePrice: number): { min: number; max: number } {
  const margin = basePrice * 0.2;
  return {
    min: Math.max(0, basePrice - margin),
    max: basePrice + margin
  };
} 