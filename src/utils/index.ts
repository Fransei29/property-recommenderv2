/**
 * Archivo de índice para exportar todas las utilidades
 * Mantiene compatibilidad con el código existente
 */

// Funciones de búsqueda
export { normalizeText, flexibleTextSearch } from './searchUtils';

// Funciones de similitud y recomendaciones
export { calculateSimilarity, generateSimilarityReasons, getRecommendations } from './similarityUtils';

// Funciones de filtrado
export { filterProperties, getPropertyTypeLabel, getPriceRange } from './filterUtils';

// Funciones de formateo
export { formatPrice } from './formatUtils'; 