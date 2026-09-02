// API de cotizaciones: GET (admin lista) y POST (publica crea)
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { calculatePriceRange } from '@/lib/pricing'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendQuoteEmail, isEmailConfigured } from '@/lib/email'
import { QuotePDF } from '@/components/admin/quote-pdf'
import { renderToBuffer } from '@react-pdf/renderer'

// Esquema de validacion para crear cotizacion
const createQuoteSchema = z.object({
  propertyType: z.enum(['residential', 'commercial']),
  sqft: z.number().int().positive().max(1000000),
  cleaningLevel: z.enum(['rough', 'final', 'both']),
  hasDebris: z.boolean(),
  hasStickers: z.boolean(),
  // Datos del cliente (opcionales en web hasta agendar inspeccion)
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  projectAddress: z.string().optional(),
  source: z.enum(['web', 'manual']).default('web'),
  notes: z.string().optional(),
  // Campos antispam
  website: z.string().optional(), // honeypot - debe estar vacio
  _ts: z.number().optional(), // timestamp del formulario
})

// POST: crear cotizacion (publico y manual)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createQuoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // === ANTISPAM CHECKS (solo para web) ===
    if (data.source === 'web') {
      // 1. Honeypot: si el campo "website" tiene contenido, es un bot
      if (data.website && data.website.trim().length > 0) {
        return NextResponse.json({ quote: { id: 'spam-rejected' } }, { status: 201 })
      }
      // 2. Time check: si el formulario se envio en menos de 2 segundos, es un bot
      if (data._ts) {
        const elapsed = Date.now() - data._ts
        if (elapsed < 2000) {
          return NextResponse.json({ quote: { id: 'spam-rejected' } }, { status: 201 })
        }
      }
    }

    // Si es manual, requerir auth y datos del cliente
    if (data.source === 'manual') {
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (!data.customerName || !data.customerEmail || !data.customerPhone || !data.projectAddress) {
        return NextResponse.json(
          { error: 'Manual quotes require full customer data' },
          { status: 400 }
        )
      }
    }

    // Calcular rango de precios
    const range = await calculatePriceRange({
      propertyType: data.propertyType,
      sqft: data.sqft,
      cleaningLevel: data.cleaningLevel,
      hasDebris: data.hasDebris,
      hasStickers: data.hasStickers,
    })

    const quote = await db.quote.create({
      data: {
        source: data.source,
        status: 'pending',
        propertyType: data.propertyType,
        sqft: data.sqft,
        cleaningLevel: data.cleaningLevel,
        hasDebris: data.hasDebris,
        hasStickers: data.hasStickers,
        minPrice: range.minPrice,
        maxPrice: range.maxPrice,
        customerName: data.customerName || null,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        projectAddress: data.projectAddress || null,
        notes: data.notes || null,
      },
    })

    // Si es una cotizacion web con email del cliente, enviar el email automaticamente
    // (silencioso si el email no esta configurado)
    if (data.source === 'web' && data.customerEmail && isEmailConfigured()) {
      try {
        const { renderToBuffer } = await import('@react-pdf/renderer')
        const { QuotePDF } = await import('@/components/admin/quote-pdf')
        const pdfBuffer = await renderToBuffer(
          <QuotePDF
            data={{
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
            }}
          />
        )
        await sendQuoteEmail({
          to: data.customerEmail,
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
      } catch (emailError) {
        // El email fallo pero la cotizacion se guardo - no fallar la respuesta
        console.error('Failed to send email (quote still saved):', emailError)
      }
    }

    return NextResponse.json({ quote, priceRange: range }, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}

// GET: listar cotizaciones (admin only) con filtros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending | approved | rejected | all
    const source = searchParams.get('source') // web | manual | all
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (source && source !== 'all') where.source = source
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { projectAddress: { contains: search } },
      ]
    }

    const quotes = await db.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
