/**
 * Componente Filters - Filtros para el listado de propiedades
 */

import React, { useState, useCallback } from 'react';
import { PropertyFilters } from '../../types/types';
import { formatPrice } from '../../utils';
import styles from './Filters.module.scss';

interface FiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters?: () => void;
  ciudades: string[];
  tiposPropiedad: string[];
  className?: string;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  ciudades,
  tiposPropiedad,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof PropertyFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = useCallback(() => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange({});
    }
  }, [onClearFilters, onFiltersChange]);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className={`${styles.filters} ${className}`}>
      {/* Header de filtros */}
      <div className={styles.header}>
        <h3 className={styles.title}>Filtros</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggleButton}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Ocultar' : 'Mostrar'}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`${styles.chevron} ${isExpanded ? styles.rotated : ''}`}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>

      {/* Contenido de filtros */}
      <div className={`${styles.content} ${isExpanded ? styles.expanded : ''}`}>
        {/* Filtro por ciudad */}
        <div className={styles.filterGroup}>
          <label htmlFor="ciudad-filter" className={styles.label}>
            Ciudad
          </label>
          <select
            id="ciudad-filter"
            value={filters.ciudad || ''}
            onChange={(e) => handleInputChange('ciudad', e.target.value || undefined)}
            className={styles.select}
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map(ciudad => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tipo */}
        <div className={styles.filterGroup}>
          <label htmlFor="tipo-filter" className={styles.label}>
            Tipo de propiedad
          </label>
          <select
            id="tipo-filter"
            value={filters.tipo || ''}
            onChange={(e) => handleInputChange('tipo', e.target.value || undefined)}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>
            {tiposPropiedad.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por rango de precio */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>
            Rango de precio
          </label>
          <div className={styles.priceRange}>
            <div className={styles.priceInput}>
              <label htmlFor="precio-min" className={styles.priceLabel}>
                Mínimo
              </label>
              <input
                id="precio-min"
                type="number"
                placeholder="0"
                value={filters.precioMin || ''}
                onChange={(e) => handleInputChange('precioMin', e.target.value ? Number(e.target.value) : undefined)}
                className={styles.priceField}
                min="0"
              />
            </div>
            <div className={styles.priceSeparator}>-</div>
            <div className={styles.priceInput}>
              <label htmlFor="precio-max" className={styles.priceLabel}>
                Máximo
              </label>
              <input
                id="precio-max"
                type="number"
                placeholder="Sin límite"
                value={filters.precioMax || ''}
                onChange={(e) => handleInputChange('precioMax', e.target.value ? Number(e.target.value) : undefined)}
                className={styles.priceField}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className={styles.clearButton}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Filtros activos:</span>
            <div className={styles.activeFiltersList}>
              {filters.ciudad && (
                <span className={styles.activeFilter}>
                  Ciudad: {filters.ciudad}
                  <button
                    onClick={() => handleInputChange('ciudad', undefined)}
                    className={styles.removeFilter}
                    aria-label={`Remover filtro de ciudad: ${filters.ciudad}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.tipo && (
                <span className={styles.activeFilter}>
                  Tipo: {filters.tipo}
                  <button
                    onClick={() => handleInputChange('tipo', undefined)}
                    className={styles.removeFilter}
                    aria-label={`Remover filtro de tipo: ${filters.tipo}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.precioMin || filters.precioMax) && (
                <span className={styles.activeFilter}>
                  Precio: {filters.precioMin ? formatPrice(filters.precioMin) : '0'} - {filters.precioMax ? formatPrice(filters.precioMax) : 'Sin límite'}
                  <button
                    onClick={() => {
                      handleInputChange('precioMin', undefined);
                      handleInputChange('precioMax', undefined);
                    }}
                    className={styles.removeFilter}
                    aria-label="Remover filtro de precio"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 