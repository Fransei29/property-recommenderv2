'use client';

/**
 * Listado de propiedades con buscador, filtros y paginación
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Property } from '@/lib/api';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { SearchBar } from '../SearchBar/SearchBar';
import { Filters } from '../Filters/Filters';
import { Pagination } from '../Pagination/Pagination';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecommendations } from '@/hooks/useRecommendations';
import styles from './PropertyBrowser.module.scss';

const ITEMS_PER_PAGE = 12;

interface PropertyBrowserProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export const PropertyBrowser: React.FC<PropertyBrowserProps> = ({ properties, onPropertyClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const favorites = useFavorites();
  const recommendations = useRecommendations(properties, handleClearSearch);
  const { updateFilters } = recommendations;

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return recommendations.filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [recommendations.filteredProperties, currentPage]);

  const totalPages = Math.ceil(recommendations.filteredProperties.length / ITEMS_PER_PAGE);

  useEffect(() => {
    updateFilters({ searchQuery });
  }, [searchQuery, updateFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations.filters, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.main}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.searchSection}>
              <h3 className={styles.sectionTitle}>Buscar</h3>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por título, ciudad, tipo..."
              />
            </div>

            <div className={styles.filtersSection}>
              <Filters
                filters={recommendations.filters}
                onFiltersChange={recommendations.updateFilters}
                onClearFilters={recommendations.clearFilters}
                ciudades={recommendations.getUniqueCities}
                tiposPropiedad={recommendations.getUniqueTypes}
              />
            </div>

            <div className={styles.statsSection}>
              <h3 className={styles.sectionTitle}>Resumen</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total:</span>
                  <span className={styles.statValue}>{recommendations.getFilterStats.total}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Mostrando:</span>
                  <span className={styles.statValue}>{recommendations.getFilterStats.filtered}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Favoritos:</span>
                  <span className={styles.statValue}>{favorites.getFavoritesCount()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.content}>
          <section className={styles.propertiesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Propiedades disponibles
                {recommendations.hasActiveFilters && (
                  <span className={styles.filteredIndicator}>
                    ({recommendations.getFilterStats.filtered} resultados)
                  </span>
                )}
              </h2>

              {recommendations.hasActiveFilters && (
                <button onClick={recommendations.clearFilters} className={styles.clearFiltersButton}>
                  Limpiar filtros
                </button>
              )}
            </div>

            {paginatedProperties.length > 0 ? (
              <div className={styles.propertiesGrid}>
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favorites.isFavorite(property.id)}
                    onToggleFavorite={favorites.toggleFavorite}
                    onClick={onPropertyClick}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <h3>No se encontraron propiedades</h3>
                  <p>Intenta ajustar los filtros o la búsqueda</p>
                  {recommendations.hasActiveFilters && (
                    <button onClick={recommendations.clearFilters} className={styles.clearFiltersButton}>
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.paginationSection}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
