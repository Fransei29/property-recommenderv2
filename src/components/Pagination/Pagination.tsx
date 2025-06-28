/**
 * Componente Pagination - Navegación de páginas
 */

import React from 'react';
import { PaginationProps } from '../../types/types';
import styles from './Pagination.module.scss';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const delta = 2; // Número de páginas a mostrar antes y después de la actual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Información de páginas */}
      <div className={styles.info}>
        <span className={styles.infoText}>
          Página {currentPage} de {totalPages}
        </span>
      </div>

      {/* Navegación */}
      <nav className={styles.navigation} role="navigation" aria-label="Navegación de páginas">
        {/* Botón anterior */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`${styles.pageButton} ${styles.previousButton}`}
          aria-label="Página anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          <span>Anterior</span>
        </button>

        {/* Números de página */}
        <div className={styles.pageNumbers}>
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className={styles.dots}>
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`${styles.pageButton} ${styles.numberButton} ${isActive ? styles.active : ''}`}
                aria-label={`Página ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`${styles.pageButton} ${styles.nextButton}`}
          aria-label="Página siguiente"
        >
          <span>Siguiente</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </nav>

      {/* Información adicional */}
      <div className={styles.summary}>
        <span className={styles.summaryText}>
          Mostrando página {currentPage} de {totalPages} páginas
        </span>
      </div>
    </div>
  );
}; 