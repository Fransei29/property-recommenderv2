/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea el precio en formato de moneda
 * @param price - Precio en números
 * @returns Precio formateado
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
} 