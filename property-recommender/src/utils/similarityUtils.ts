/**
 * Utilidades para cálculo de similitud y recomendaciones
 */

import { Property, RecommendationResult } from '../types/types';

/**
 * Calcula la similitud entre dos propiedades basada en múltiples criterios
 * @param property1 - Propiedad base para comparar
 * @param property2 - Propiedad a comparar
 * @returns Puntuación de similitud entre 0 y 1
 */
export function calculateSimilarity(property1: Property, property2: Property): number {
  let totalScore = 0;
  let maxScore = 0;

  // Similitud por ciudad (peso: 0.3)
  const cityScore = property1.ciudad === property2.ciudad ? 1 : 0;
  totalScore += cityScore * 0.3;
  maxScore += 0.3;

  // Similitud por tipo (peso: 0.25)
  const typeScore = property1.tipo === property2.tipo ? 1 : 0;
  totalScore += typeScore * 0.25;
  maxScore += 0.25;

  // Similitud por precio (peso: 0.25)
  const priceDifference = Math.abs(property1.precio - property2.precio);
  const priceScore = Math.max(0, 1 - (priceDifference / property1.precio));
  totalScore += priceScore * 0.25;
  maxScore += 0.25;

  // Similitud por área (peso: 0.1)
  const areaDifference = Math.abs(property1.metros_cuadrados - property2.metros_cuadrados);
  const areaScore = Math.max(0, 1 - (areaDifference / Math.max(property1.metros_cuadrados, property2.metros_cuadrados)));
  totalScore += areaScore * 0.1;
  maxScore += 0.1;

  // Similitud por ambientes (peso: 0.1)
  const bedroomDifference = Math.abs(property1.ambientes - property2.ambientes);
  const bedroomScore = Math.max(0, 1 - (bedroomDifference / Math.max(property1.ambientes, property2.ambientes)));
  totalScore += bedroomScore * 0.1;
  maxScore += 0.1;

  return totalScore / maxScore;
}

/**
 * Genera razones de similitud entre dos propiedades
 * @param property1 - Propiedad base
 * @param property2 - Propiedad comparada
 * @returns Array de razones de similitud
 */
export function generateSimilarityReasons(property1: Property, property2: Property): string[] {
  const reasons: string[] = [];

  if (property1.ciudad === property2.ciudad) {
    reasons.push(`Misma ciudad: ${property1.ciudad}`);
  }

  if (property1.tipo === property2.tipo) {
    reasons.push(`Mismo tipo: ${property1.tipo}`);
  }

  const priceDifference = Math.abs(property1.precio - property2.precio);
  const pricePercentage = (priceDifference / property1.precio) * 100;
  
  if (pricePercentage <= 20) {
    reasons.push(`Precio similar (±${pricePercentage.toFixed(1)}%)`);
  }

  const areaDifference = Math.abs(property1.metros_cuadrados - property2.metros_cuadrados);
  const areaPercentage = (areaDifference / Math.max(property1.metros_cuadrados, property2.metros_cuadrados)) * 100;
  
  if (areaPercentage <= 30) {
    reasons.push(`Área similar (±${areaPercentage.toFixed(1)}%)`);
  }

  const bedroomDifference = Math.abs(property1.ambientes - property2.ambientes);
  if (bedroomDifference <= 1) {
    reasons.push(`Misma cantidad de ambientes (±${bedroomDifference})`);
  }

  return reasons;
}

/**
 * Obtiene recomendaciones para una propiedad específica
 * @param targetProperty - Propiedad para la cual buscar recomendaciones
 * @param allProperties - Lista completa de propiedades
 * @param maxRecommendations - Número máximo de recomendaciones
 * @returns Array de recomendaciones ordenadas por similitud
 */
export function getRecommendations(
  targetProperty: Property,
  allProperties: Property[],
  maxRecommendations: number = 3
): RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];

  for (const property of allProperties) {
    // Excluir la propiedad actual
    if (property.id === targetProperty.id) continue;

    const similarityScore = calculateSimilarity(targetProperty, property);
    const reasons = generateSimilarityReasons(targetProperty, property);

    recommendations.push({
      property,
      similarityScore,
      reasons
    });
  }

  // Ordenar por puntuación de similitud descendente
  recommendations.sort((a, b) => b.similarityScore - a.similarityScore);

  // Retornar solo las mejores recomendaciones
  return recommendations.slice(0, maxRecommendations);
} 