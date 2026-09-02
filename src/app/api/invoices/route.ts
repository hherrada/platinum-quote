// API de invoices: GET (listar) y POST (crear)
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createInvoiceSchema = z.object({
  // Si se genera desde una quote
  quoteId: z.string().optional(),
  // Datos del cliente
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  projectAddress: z.string().min(1),
  // Datos del proyecto
  propertyType: z.enum(['residential', 'commercial']),
  cleaningLevel: z.enum(['rough', 'final', 'both']),
  sqft: z.number().int().positive(),
  hasDebris: z.boolean(),
  hasStickers: z.boolean(),
  // Montos
  totalAmount: z.number().positive(),
  isDeposit: z.boolean().default(false),
  dueDate: z.string(), // ISO date
  notes: z.string().optional(),
})

// GET: listar invoices (admin only) con filtros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { number: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { projectAddress: { contains: search } },
      ]
    }

    const invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST: crear invoice (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    // Generar numero correlativo
    const number = await generateInvoiceNumber()

    // Calcular amountDue
    const amountDue = data.isDeposit ? data.totalAmount * 0.5 : data.totalAmount

    const invoice = await db.invoice.create({
      data: {
        number,
        quoteId: data.quoteId || null,
        status: 'draft',
        isDeposit: data.isDeposit,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        projectAddress: data.projectAddress,
        propertyType: data.propertyType,
        cleaningLevel: data.cleaningLevel,
        sqft: data.sqft,
        hasDebris: data.hasDebris,
        hasStickers: data.hasStickers,
        totalAmount: data.totalAmount,
        amountDue,
        issueDate: new Date(),
        dueDate: new Date(data.dueDate),
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
