/**
 * Utilidades para filtrado de propiedades
 */

import { Property } from '@/lib/api';

/**
 * Búsqueda flexible de texto (case-insensitive, sin acentos)
 */
function flexibleTextSearch(text: string, query: string): boolean {
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '');
  
  return normalize(text).includes(normalize(query));
}

export interface PropertyFilters {
  ciudad?: string;
  tipo?: string;
  precioMin?: number;
  precioMax?: number;
  searchQuery?: string;
}

/**
 * Filtra propiedades según criterios específicos
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  return properties.filter(property => {
    // Filtro por ciudad
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

    // Filtro por búsqueda de texto
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




