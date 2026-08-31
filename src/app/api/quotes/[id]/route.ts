// API de cotizacion individual: GET, PATCH (cambiar estado / editar), POST (duplicar)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculatePriceRange } from '@/lib/pricing'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: obtener una cotizacion por id (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const quote = await db.quote.findUnique({ where: { id } })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

// PATCH: actualizar estado o datos de una cotizacion (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Si se esta duplicando (action: duplicate)
    if (body.action === 'duplicate') {
      const original = await db.quote.findUnique({ where: { id } })
      if (!original) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
      }
      const duplicated = await db.quote.create({
        data: {
          source: 'manual',
          status: 'pending',
          propertyType: original.propertyType,
          sqft: original.sqft,
          cleaningLevel: original.cleaningLevel,
          hasDebris: original.hasDebris,
          hasStickers: original.hasStickers,
          minPrice: original.minPrice,
          maxPrice: original.maxPrice,
          finalPrice: null, // el duplicado empieza sin precio final
          customerName: original.customerName,
          customerEmail: original.customerEmail,
          customerPhone: original.customerPhone,
          projectAddress: original.projectAddress,
          notes: original.notes,
        },
      })
      return NextResponse.json({ quote: duplicated }, { status: 201 })
    }

    const allowedFields = [
      'status',
      'customerName',
      'customerEmail',
      'customerPhone',
      'projectAddress',
      'notes',
      'minPrice',
      'maxPrice',
      'finalPrice',
      'propertyType',
      'sqft',
      'cleaningLevel',
      'hasDebris',
      'hasStickers',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Si se cambiaron datos del proyecto que afectan el precio, recalcular
    const recalcFields = ['propertyType', 'sqft', 'cleaningLevel', 'hasDebris', 'hasStickers']
    const needsRecalc = recalcFields.some((f) => body[f] !== undefined)
    if (needsRecalc) {
      const current = await db.quote.findUnique({ where: { id } })
      if (current) {
        const range = await calculatePriceRange({
          propertyType: (updateData.propertyType as 'residential' | 'commercial') || (current.propertyType as 'residential' | 'commercial'),
          sqft: (updateData.sqft as number) || current.sqft,
          cleaningLevel: (updateData.cleaningLevel as 'rough' | 'final' | 'both') || (current.cleaningLevel as 'rough' | 'final' | 'both'),
          hasDebris: updateData.hasDebris !== undefined ? (updateData.hasDebris as boolean) : current.hasDebris,
          hasStickers: updateData.hasStickers !== undefined ? (updateData.hasStickers as boolean) : current.hasStickers,
        })
        updateData.minPrice = range.minPrice
        updateData.maxPrice = range.maxPrice
      }
    }

    const quote = await db.quote.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

// DELETE: eliminar cotizacion (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await db.quote.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
