/**
 * Utilidades para formateo de datos
 */

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function getPropertyTypeLabel(type: string): string {
  return type;
}




