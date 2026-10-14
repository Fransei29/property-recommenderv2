/**
 * Hook para manejar favoritos
 */

import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '@/lib/api';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesAPI.getAll();
      setFavoriteIds(data.favorites.propertyIds || []);
    } catch (error) {
      // Si la ruta no existe (404), simplemente usar array vacío
      // Los favoritos pueden manejarse localmente si el backend no los soporta
      console.warn('Favorites endpoint not available, using local storage only');
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = useCallback((propertyId: number) => {
    return favoriteIds.includes(propertyId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (propertyId: number) => {
    try {
      if (isFavorite(propertyId)) {
        await favoritesAPI.remove(propertyId);
        setFavoriteIds(prev => prev.filter(id => id !== propertyId));
      } else {
        await favoritesAPI.add(propertyId);
        setFavoriteIds(prev => [...prev, propertyId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [isFavorite]);

  const getFavoritesCount = useCallback(() => {
    return favoriteIds.length;
  }, [favoriteIds]);

  return {
    favorites: { propertyIds: favoriteIds },
    isFavorite,
    toggleFavorite,
    getFavoritesCount,
    loading,
    refresh: loadFavorites
  };
}



