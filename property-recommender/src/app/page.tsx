/**
 * Página principal del sistema de recomendación de propiedades
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Property } from '../types/types';
import { useFavorites } from '../hooks/useFavorites';
import { useRecommendations } from '../hooks/useRecommendations';
import { PropertyCard } from '../components/PropertyCard/PropertyCard';
import PropertyDetail from '../components/PropertyDetail/PropertyDetail';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { Filters } from '../components/Filters/Filters';
import { RecommendationList } from '../components/RecommendationList/RecommendationList';
import { Pagination } from '../components/Pagination/Pagination';
import { formatPrice } from '../utils';
import { getPropertiesWithDescription } from '../data/loadProperties';
import styles from './page.module.scss';

const ITEMS_PER_PAGE = 12;

export default function HomePage() {
  const { data: session, status } = useSession();
  
  // Estados
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Cargar propiedades al inicializar
  useEffect(() => {
    try {
      const loadedProperties = getPropertiesWithDescription();
      console.log('Properties loaded:', loadedProperties.length);
      setProperties(loadedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hooks personalizados
  const favorites = useFavorites();
  const recommendations = useRecommendations(properties, () => setSearchQuery(''));

  // Debug: Verificar que las propiedades se pasan correctamente
  useEffect(() => {
    console.log('Properties state updated:', properties.length);
  }, [properties]);

  // Propiedades filtradas y paginadas
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const result = recommendations.filteredProperties.slice(startIndex, endIndex);
    return result;
  }, [recommendations.filteredProperties, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(recommendations.filteredProperties.length / ITEMS_PER_PAGE);
  }, [recommendations.filteredProperties.length]);

  // Actualizar filtros cuando cambie la búsqueda
  useEffect(() => {
    recommendations.updateFilters({ searchQuery });
  }, [searchQuery]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations.filters, searchQuery]);

  const handlePropertyClick = (property: Property) => {
    setSelectedPropertyId(property.id);
    recommendations.selectProperty(property);
  };

  const handleBackToList = () => {
    setSelectedPropertyId(null);
    recommendations.clearSelection();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Obtener la propiedad seleccionada
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, properties]);

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              className={styles.spinnerCircle}
            />
          </svg>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión, no mostrar nada (AuthGuard se encargará de la redirección)
  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              className={styles.spinnerCircle}
            />
          </svg>
          <p>Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  // Si hay una propiedad seleccionada, mostrar la vista detallada
  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        recommendations={recommendations.recommendations}
        onPropertyClick={handlePropertyClick}
        onBackClick={handleBackToList}
        isFavorite={favorites.isFavorite(selectedProperty.id)}
        onToggleFavorite={favorites.toggleFavorite}
      />
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Bienvenido a Habita
          </h1>
          <h2 className={styles.subtitle}>
            Encuentra tu próximo hogar con recomendaciones personalizadas basadas en tus intereses.
          </h2>
        </div>
      </header>

      {/* Contenido principal */}
      <main className={styles.main}>
        <div className={styles.layout}>
          {/* Sidebar con filtros */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              {/* Buscador */}
              <div className={styles.searchSection}>
                <h3 className={styles.sectionTitle}>Buscar</h3>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Buscar por título, ciudad, tipo..."
                />
              </div>

              {/* Filtros */}
              <div className={styles.filtersSection}>
                <Filters
                  filters={recommendations.filters}
                  onFiltersChange={recommendations.updateFilters}
                  onClearFilters={recommendations.clearFilters}
                  ciudades={recommendations.getUniqueCities}
                  tiposPropiedad={recommendations.getUniqueTypes}
                />
              </div>

              {/* Estadísticas */}
              <div className={styles.statsSection}>
                <h3 className={styles.sectionTitle}>Estadísticas</h3>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total:</span>
                    <span className={styles.statValue}>{recommendations.getFilterStats.total}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Filtradas:</span>
                    <span className={styles.statValue}>{recommendations.getFilterStats.filtered}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Precio promedio:</span>
                    <span className={styles.statValue}>
                      {formatPrice(recommendations.getFilterStats.avgPrice)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Favoritos:</span>
                    <span className={styles.statValue}>{favorites.getFavoritesCount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className={styles.content}>
            {/* Recomendaciones */}
            {recommendations.recommendations.length > 0 && (
              <section className={styles.recommendationsSection}>
                <RecommendationList
                  recommendations={recommendations.recommendations}
                  onPropertyClick={handlePropertyClick}
                />
              </section>
            )}

            {/* Listado de propiedades */}
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
                  <button
                    onClick={recommendations.clearFilters}
                    className={styles.clearFiltersButton}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Grid de propiedades */}
              {paginatedProperties.length > 0 ? (
                <div className={styles.propertiesGrid}>
                  {paginatedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favorites.isFavorite(property.id)}
                      onToggleFavorite={favorites.toggleFavorite}
                      onClick={handlePropertyClick}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateContent}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    <h3>No se encontraron propiedades</h3>
                    <p>Intenta ajustar los filtros o la búsqueda</p>
                    <button
                      onClick={recommendations.clearFilters}
                      className={styles.clearFiltersButton}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className={styles.paginationSection}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
