/**
 * Hook personalizado para manejar recomendaciones de propiedades
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property } from '@/lib/api';
import { filterProperties, PropertyFilters } from '@/utils/filterUtils';

export interface RecommendationResult {
  property: Property;
  score: number;
  reasons: string[];
}

/**
 * Genera recomendaciones basadas en una propiedad seleccionada
 */
function getRecommendations(
  selectedProperty: Property,
  allProperties: Property[],
  limit: number = 3
): RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];
  
  for (const property of allProperties) {
    if (property.id === selectedProperty.id) continue;
    
    const reasons: string[] = [];
    let score = 0;
    
    // Misma ciudad (+30 puntos)
    if (property.ciudad === selectedProperty.ciudad) {
      score += 30;
      reasons.push('Misma ciudad');
    }
    
    // Tipo similar (+20 puntos)
    if (property.tipo === selectedProperty.tipo) {
      score += 20;
      reasons.push('Mismo tipo');
    }
    
    // Precio similar (±20%) (+25 puntos)
    const priceDiff = Math.abs(property.precio - selectedProperty.precio);
    const priceRange = selectedProperty.precio * 0.2;
    if (priceDiff <= priceRange) {
      score += 25;
      reasons.push('Precio similar');
    }
    
    // Mismo número de ambientes (+15 puntos)
    if (property.ambientes === selectedProperty.ambientes) {
      score += 15;
      reasons.push('Mismo número de ambientes');
    }
    
    // Tamaño similar (±10%) (+10 puntos)
    const sizeDiff = Math.abs(property.metros_cuadrados - selectedProperty.metros_cuadrados);
    const sizeRange = selectedProperty.metros_cuadrados * 0.1;
    if (sizeDiff <= sizeRange) {
      score += 10;
      reasons.push('Tamaño similar');
    }
    
    if (score > 0) {
      recommendations.push({
        property,
        score,
        reasons
      });
    }
  }
  
  // Ordenar por score y tomar los primeros
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function useRecommendations(
  allProperties: Property[],
  onClearSearch?: () => void
) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});

  // Propiedades filtradas
  const filteredProperties = useMemo(() => {
    return filterProperties(allProperties, filters);
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

  const selectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProperty(null);
    setRecommendations([]);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    if (onClearSearch) {
      onClearSearch();
    }
  }, [onClearSearch]);

  const getFilterStats = useMemo(() => {
    const total = allProperties.length;
    const filtered = filteredProperties.length;
    const avgPrice = filteredProperties.length > 0 
      ? Math.round(filteredProperties.reduce((sum, p) => sum + p.precio, 0) / filteredProperties.length)
      : 0;

    return {
      total,
      filtered,
      avgPrice
    };
  }, [allProperties, filteredProperties]);

  const getUniqueCities = useMemo(() => {
    const cities = new Set(allProperties.map(p => p.ciudad));
    return Array.from(cities).sort();
  }, [allProperties]);

  const getUniqueTypes = useMemo(() => {
    const types = new Set(allProperties.map(p => p.tipo));
    return Array.from(types).sort();
  }, [allProperties]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  return {
    selectedProperty,
    recommendations,
    filteredProperties,
    filters,
    selectProperty,
    clearSelection,
    updateFilters,
    clearFilters,
    getFilterStats,
    getUniqueCities,
    getUniqueTypes,
    hasActiveFilters
  };
}




