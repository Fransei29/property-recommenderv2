/**
 * Componente SearchBar - Buscador con debounce
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SearchBarProps } from '../../types/types';
import styles from './SearchBar.module.scss';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar propiedades...',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        setIsSearching(true);
        onChange(inputValue);
        // Simular delay de búsqueda
        setTimeout(() => setIsSearching(false), 300);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);

  // Sincronizar inputValue con value externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`${styles.searchBar} ${className}`}>
      <div className={styles.inputContainer}>
        {/* Icono de búsqueda */}
        <div className={styles.searchIcon}>
          {isSearching ? (
            <div className={styles.spinner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>

        {/* Input de búsqueda */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          aria-label="Buscar propiedades"
        />

        {/* Botón de limpiar */}
        {inputValue && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Limpiar búsqueda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Indicador de búsqueda activa */}
      {isSearching && (
        <div className={styles.searchingIndicator}>
          <span>Buscando...</span>
        </div>
      )}
    </div>
  );
}; 