/**
 * Utilidad para cargar los datos de propiedades desde la API
 */

import { propertiesAPI, Property } from '../lib/api';

/**
 * Carga las propiedades desde la API del backend
 * @returns Array de propiedades tipadas
 */
export async function loadProperties(): Promise<Property[]> {
  try {
    const properties = await propertiesAPI.getAll();
    return properties;
  } catch (error) {
    console.error('Error loading properties from API:', error);
    // Fallback: retornar array vacío en caso de error
    return [];
  }
}

/**
 * Obtiene las propiedades con descripción generada basada en los datos existentes
 * @returns Array de propiedades con descripción
 */
export async function getPropertiesWithDescription(): Promise<Property[]> {
  const properties = await loadProperties();
  
  return properties.map(property => ({
    ...property,
    // Si no tiene descripción, generar una basada en los datos reales disponibles
    descripcion: property.descripcion || `${property.tipo} en ${property.ciudad} con ${property.ambientes} ambientes y ${property.metros_cuadrados}m². ${property.titulo}.`
  }));
} 