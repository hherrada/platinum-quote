// Logica de calculo de rango de precios para cotizaciones
// Usa la matriz de precios y servicios adicionales desde la base de datos
import { db } from './db'

export type PropertyType = 'residential' | 'commercial'
export type CleaningLevel = 'rough' | 'final' | 'both'

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
    levels: string[] // niveles incluidos en el calculo
  }
}

/**
 * Calcula el rango de precios estimado basado en sqft, tipo de propiedad,
 * nivel de limpieza y servicios adicionales (escombros, stickers).
 * Los precios nunca son cerrados: son estimaciones sujetas a inspeccion visual.
 * Si cleaningLevel es "both", suma las tarifas de rough + final.
 */
export async function calculatePriceRange(input: QuoteInput): Promise<PriceRange> {
  // Obtener las tarifas de la matriz de precios
  const levelsToQuery: ('rough' | 'final')[] =
    input.cleaningLevel === 'both' ? ['rough', 'final'] : [input.cleaningLevel]

  const pricings = await db.pricingMatrix.findMany({
    where: {
      propertyType: input.propertyType,
      cleaningLevel: { in: levelsToQuery },
      isActive: true,
    },
  })

  if (pricings.length === 0) {
    throw new Error(
      `No pricing found for propertyType=${input.propertyType}, cleaningLevel=${input.cleaningLevel}`
    )
  }

  // Sumar las tarifas de todos los niveles seleccionados
  let rateMin = 0
  let rateMax = 0
  for (const p of pricings) {
    rateMin += p.minRatePerSqft
    rateMax += p.maxRatePerSqft
  }

  // Costo base = sqft x tarifa total
  const baseMin = input.sqft * rateMin
  const baseMax = input.sqft * rateMax

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
      rateMin,
      rateMax,
      levels: levelsToQuery,
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
