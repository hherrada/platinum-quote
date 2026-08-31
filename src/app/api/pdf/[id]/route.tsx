// API para generar y descargar el PDF de una cotizacion
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuotePDF } from '@/components/admin/quote-pdf'
import { renderToBuffer } from '@react-pdf/renderer'

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

    // Recalcular el breakdown para el PDF
    const { calculatePriceRange } = await import('@/lib/pricing')
    const range = await calculatePriceRange({
      propertyType: quote.propertyType as 'residential' | 'commercial',
      sqft: quote.sqft,
      cleaningLevel: quote.cleaningLevel as 'rough' | 'final',
      hasDebris: quote.hasDebris,
      hasStickers: quote.hasStickers,
    })

    const pdfData = {
      quoteId: quote.id,
      customerName: quote.customerName || '',
      customerEmail: quote.customerEmail || '',
      customerPhone: quote.customerPhone || '',
      projectAddress: quote.projectAddress || '',
      propertyType: quote.propertyType,
      cleaningLevel: quote.cleaningLevel,
      sqft: quote.sqft,
      hasDebris: quote.hasDebris,
      hasStickers: quote.hasStickers,
      minPrice: quote.minPrice,
      maxPrice: quote.maxPrice,
      finalPrice: quote.finalPrice,
      notes: quote.notes,
      createdAt: quote.createdAt.toISOString(),
      breakdown: range.breakdown,
    }

    const buffer = await renderToBuffer(<QuotePDF data={pdfData} />)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.id.slice(-8).toUpperCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
