// API para enviar cotizacion por email con PDF adjunto
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuotePDF } from '@/components/admin/quote-pdf'
import { renderToBuffer } from '@react-pdf/renderer'
import { sendQuoteEmail, isEmailConfigured } from '@/lib/email'
import { calculatePriceRange } from '@/lib/pricing'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({
        error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.',
      }, { status: 500 })
    }

    const { id } = await params
    const body = await req.json()
    const { to } = body

    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

    const quote = await db.quote.findUnique({ where: { id } })
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Recalcular el breakdown para el PDF
    const range = await calculatePriceRange({
      propertyType: quote.propertyType as 'residential' | 'commercial',
      sqft: quote.sqft,
      cleaningLevel: quote.cleaningLevel as 'rough' | 'final' | 'both',
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

    // Generar el PDF
    const pdfBuffer = await renderToBuffer(<QuotePDF data={pdfData} />)

    // Enviar el email con el PDF adjunto
    await sendQuoteEmail({
      to,
      customerName: quote.customerName || 'Valued Customer',
      quoteId: quote.id,
      minPrice: quote.minPrice,
      maxPrice: quote.maxPrice,
      finalPrice: quote.finalPrice,
      propertyType: quote.propertyType,
      cleaningLevel: quote.cleaningLevel,
      sqft: quote.sqft,
      attachment: {
        filename: `quote-${quote.id.slice(-8).toUpperCase()}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
      },
    })

    return NextResponse.json({ success: true, message: `Email sent to ${to}` })
  } catch (error) {
    console.error('Error sending email:', error)
    const message = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
