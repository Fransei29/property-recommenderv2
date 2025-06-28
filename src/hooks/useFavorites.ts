/**
 * Hook personalizado para manejar favoritos con localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { FavoritesState } from '../types/types';

const FAVORITES_STORAGE_KEY = 'property-favorites';

/**
 * Hook para manejar propiedades favoritas
 * @returns Objeto con estado y funciones para manejar favoritos
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesState>({ propertyIds: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar favoritos desde localStorage al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoritesState;
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoaded]);

  /**
   * Agregar o remover una propiedad de favoritos
   * @param propertyId - ID de la propiedad
   */
  const toggleFavorite = useCallback((propertyId: number) => {
    setFavorites(prev => {
      const isFavorite = prev.propertyIds.includes(propertyId);
      
      if (isFavorite) {
        // Remover de favoritos
        return {
          propertyIds: prev.propertyIds.filter(id => id !== propertyId)
        };
      } else {
        // Agregar a favoritos
        return {
          propertyIds: [...prev.propertyIds, propertyId]
        };
      }
    });
  }, []);

  /**
   * Verificar si una propiedad está en favoritos
   * @param propertyId - ID de la propiedad
   * @returns true si está en favoritos
   */
  const isFavorite = useCallback((propertyId: number): boolean => {
    return favorites.propertyIds.includes(propertyId);
  }, [favorites.propertyIds]);

  /**
   * Obtener el número total de favoritos
   * @returns Número de propiedades favoritas
   */
  const getFavoritesCount = useCallback((): number => {
    return favorites.propertyIds.length;
  }, [favorites.propertyIds]);

  /**
   * Limpiar todos los favoritos
   */
  const clearFavorites = useCallback(() => {
    setFavorites({ propertyIds: [] });
  }, []);

  /**
   * Agregar múltiples propiedades a favoritos
   * @param propertyIds - Array de IDs de propiedades
   */
  const addMultipleFavorites = useCallback((propertyIds: number[]) => {
    setFavorites(prev => ({
      propertyIds: [...new Set([...prev.propertyIds, ...propertyIds])]
    }));
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoritesCount,
    clearFavorites,
    addMultipleFavorites,
    isLoaded
  };
} 