/**
 * Utilidades para búsqueda y normalización de texto
 */

/**
 * Normaliza texto para búsquedas flexibles (quita tildes, convierte a minúsculas)
 * @param text - Texto a normalizar
 * @returns Texto normalizado
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita diacríticos (tildes)
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .trim();
}

/**
 * Verifica si un texto contiene una consulta de búsqueda de manera flexible
 * @param text - Texto donde buscar
 * @param query - Consulta de búsqueda
 * @returns true si el texto contiene la consulta
 */
export function flexibleTextSearch(text: string, query: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  // Búsqueda exacta
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }
  
  // Búsqueda por palabras individuales
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  const textWords = normalizedText.split(' ');
  
  // Si al menos una palabra de la consulta está en el texto
  return queryWords.some(queryWord => 
    textWords.some(textWord => textWord.includes(queryWord))
  );
} 