/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea el precio en formato de moneda
 * @param price - Precio en números
 * @returns Precio formateado
 */
export function formatPrice(price: number, moneda: 'USD' | 'ARS' = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Precio de una propiedad con su moneda; los alquileres se muestran por mes
 */
export function formatPropertyPrice(property: { precio: number; moneda?: 'USD' | 'ARS'; operacion?: 'venta' | 'alquiler' }): string {
  const price = formatPrice(property.precio, property.moneda || 'USD');
  return property.operacion === 'alquiler' ? `${price} /mes` : price;
}

export function getOperacionLabel(operacion?: 'venta' | 'alquiler'): string {
  return operacion === 'alquiler' ? 'Alquiler' : 'Venta';
} 
/**
 * Resuelve la URL de una imagen: las subidas al backend (/uploads/...) se sirven desde la API
 */
export const resolveImageUrl = (url?: string | null, fallback = '/home.jpg'): string => {
  if (!url) return fallback;
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
  }
  return url;
};
