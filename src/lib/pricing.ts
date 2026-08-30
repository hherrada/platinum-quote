// Logica de calculo de rango de precios para cotizaciones
// Usa la matriz de precios y servicios adicionales desde la base de datos
import { db } from './db'

export type PropertyType = 'residential' | 'commercial'
export type CleaningLevel = 'rough' | 'final'

export interface QuoteInput {
  propertyType: PropertyType
  sqft: number
  cleaningLevel: CleaningLevel
  hasDebris: boolean
  hasStickers: boolean
}

export interface PriceRange {
  minPrice: number
  maxPrice: number
  breakdown: {
    baseMin: number
    baseMax: number
    debrisMin: number
    debrisMax: number
    stickersMin: number
    stickersMax: number
    rateMin: number
    rateMax: number
  }
}

/**
 * Calcula el rango de precios estimado basado en sqft, tipo de propiedad,
 * nivel de limpieza y servicios adicionales (escombros, stickers).
 * Los precios nunca son cerrados: son estimaciones sujetas a inspeccion visual.
 */
export async function calculatePriceRange(input: QuoteInput): Promise<PriceRange> {
  // Obtener la tarifa de la matriz de precios
  const pricing = await db.pricingMatrix.findFirst({
    where: {
      propertyType: input.propertyType,
      cleaningLevel: input.cleaningLevel,
      isActive: true,
    },
  })

  if (!pricing) {
    throw new Error(
      `No pricing found for propertyType=${input.propertyType}, cleaningLevel=${input.cleaningLevel}`
    )
  }

  // Costo base = sqft x tarifa
  const baseMin = input.sqft * pricing.minRatePerSqft
  const baseMax = input.sqft * pricing.maxRatePerSqft

  // Cargos adicionales
  let debrisMin = 0
  let debrisMax = 0
  let stickersMin = 0
  let stickersMax = 0

  if (input.hasDebris) {
    const debris = await db.additionalService.findUnique({ where: { key: 'debris' } })
    if (debris) {
      debrisMin = debris.minPrice
      debrisMax = debris.maxPrice
    }
  }

  if (input.hasStickers) {
    const stickers = await db.additionalService.findUnique({ where: { key: 'stickers' } })
    if (stickers) {
      stickersMin = stickers.minPrice
      stickersMax = stickers.maxPrice
    }
  }

  const minPrice = baseMin + debrisMin + stickersMin
  const maxPrice = baseMax + debrisMax + stickersMax

  return {
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    breakdown: {
      baseMin,
      baseMax,
      debrisMin,
      debrisMax,
      stickersMin,
      stickersMax,
      rateMin: pricing.minRatePerSqft,
      rateMax: pricing.maxRatePerSqft,
    },
  }
}

/**
 * Formatea un precio como moneda USD
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea una tarifa por sqft
 */
export function formatRate(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
