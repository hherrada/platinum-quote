// API de matriz de precios: GET (publico, para calcular en el front) y PUT (admin actualiza)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: listar toda la matriz de precios y servicios adicionales
export async function GET() {
  try {
    const matrix = await db.pricingMatrix.findMany({
      where: { isActive: true },
      orderBy: [{ propertyType: 'asc' }, { cleaningLevel: 'asc' }],
    })
    const services = await db.additionalService.findMany({
      where: { isActive: true },
    })

    return NextResponse.json({ matrix, services })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}

// PUT: actualizar tarifa por sqft de una combinacion o servicio adicional (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, id, minRatePerSqft, maxRatePerSqft, minPrice, maxPrice } = body

    if (type === 'matrix') {
      if (typeof minRatePerSqft !== 'number' || typeof maxRatePerSqft !== 'number') {
        return NextResponse.json({ error: 'minRatePerSqft and maxRatePerSqft required' }, { status: 400 })
      }
      if (minRatePerSqft > maxRatePerSqft) {
        return NextResponse.json({ error: 'Min rate cannot exceed max rate' }, { status: 400 })
      }
      const updated = await db.pricingMatrix.update({
        where: { id },
        data: { minRatePerSqft, maxRatePerSqft },
      })
      return NextResponse.json({ matrix: updated })
    }

    if (type === 'service') {
      if (typeof minPrice !== 'number' || typeof maxPrice !== 'number') {
        return NextResponse.json({ error: 'minPrice and maxPrice required' }, { status: 400 })
      }
      if (minPrice > maxPrice) {
        return NextResponse.json({ error: 'Min price cannot exceed max price' }, { status: 400 })
      }
      const updated = await db.additionalService.update({
        where: { id },
        data: { minPrice, maxPrice },
      })
      return NextResponse.json({ service: updated })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error updating pricing:', error)
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
  }
}
