/**
 * Hook personalizado para manejar recomendaciones de propiedades
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, RecommendationResult, PropertyFilters } from '../types/types';
import { getRecommendations, filterProperties } from '../utils';

/**
 * Hook para manejar recomendaciones de propiedades
 * @param allProperties - Lista completa de propiedades
 * @param onClearSearch - Función opcional para limpiar la búsqueda
 * @returns Objeto con estado y funciones para manejar recomendaciones
 */
export function useRecommendations(allProperties: Property[], onClearSearch?: () => void) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});

  // Propiedades filtradas
  const filteredProperties = useMemo(() => {
    console.log('Filtering properties:', allProperties.length);
    console.log('Current filters:', filters);
    const filtered = filterProperties(allProperties, filters);
    console.log('Filtered result:', filtered.length);
    return filtered;
  }, [allProperties, filters]);

  // Generar recomendaciones cuando se seleccione una propiedad
  useEffect(() => {
    if (selectedProperty) {
      const recs = getRecommendations(selectedProperty, allProperties, 3);
      setRecommendations(recs);
    } else {
      setRecommendations([]);
    }
  }, [selectedProperty, allProperties]);

  /**
   * Seleccionar una propiedad y generar recomendaciones
   */
  const selectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  /**
   * Limpiar la selección actual
   */
  const clearSelection = useCallback(() => {
    setSelectedProperty(null);
    setRecommendations([]);
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    // También limpiar la búsqueda si se proporciona la función
    if (onClearSearch) {
      onClearSearch();
    }
  }, [onClearSearch]);

  /**
   * Obtener estadísticas de las propiedades filtradas
   */
  const getFilterStats = useMemo(() => {
    const total = allProperties.length;
    const filtered = filteredProperties.length;
    const minPrice = filteredProperties.length > 0 ? Math.min(...filteredProperties.map(p => p.precio)) : 0;
    const maxPrice = filteredProperties.length > 0 ? Math.max(...filteredProperties.map(p => p.precio)) : 0;
    const avgPrice = filteredProperties.length > 0 
      ? filteredProperties.reduce((sum, p) => sum + p.precio, 0) / filteredProperties.length 
      : 0;

    return {
      total,
      filtered,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice)
    };
  }, [allProperties.length, filteredProperties]);

  /**
   * Obtener ciudades únicas de las propiedades
   */
  const getUniqueCities = useMemo(() => {
    const cities = new Set(allProperties.map(p => p.ciudad));
    return Array.from(cities).sort();
  }, [allProperties]);

  /**
   * Obtener tipos únicos de propiedades
   */
  const getUniqueTypes = useMemo(() => {
    const types = new Set(allProperties.map(p => p.tipo));
    return Array.from(types).sort();
  }, [allProperties]);

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  return {
    // Estado
    selectedProperty,
    recommendations,
    filteredProperties,
    filters,
    
    // Funciones
    selectProperty,
    clearSelection,
    updateFilters,
    clearFilters,
    
    // Datos calculados
    getFilterStats,
    getUniqueCities,
    getUniqueTypes,
    hasActiveFilters
  };
} 