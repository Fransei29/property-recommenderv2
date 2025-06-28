/**
 * Utilidad para cargar los datos de propiedades desde el JSON
 */

import propertiesData from './properties.json';
import { Property } from '../types/types';

/**
 * Carga las propiedades desde el archivo JSON
 * @returns Array de propiedades tipadas
 */
export function loadProperties(): Property[] {
  return propertiesData as Property[];
}

/**
 * Obtiene las propiedades con descripción generada basada en los datos existentes
 * @returns Array de propiedades con descripción
 */
export function getPropertiesWithDescription(): Property[] {
  const properties = loadProperties();
  
  return properties.map(property => ({
    ...property,
    // Generar descripción basada en los datos reales disponibles
    descripcion: `${property.tipo} en ${property.ciudad} con ${property.ambientes} ambientes y ${property.metros_cuadrados}m². ${property.titulo}.`
  }));
} 