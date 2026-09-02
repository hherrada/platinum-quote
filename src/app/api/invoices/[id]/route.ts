// API de invoice individual: GET, PATCH (editar / marcar pagado), DELETE
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const invoice = await db.invoice.findUnique({ where: { id } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

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

    const allowedFields = [
      'status',
      'customerName',
      'customerEmail',
      'customerPhone',
      'projectAddress',
      'propertyType',
      'cleaningLevel',
      'sqft',
      'hasDebris',
      'hasStickers',
      'totalAmount',
      'isDeposit',
      'dueDate',
      'notes',
      'sentAt',
      'paidAt',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Si se cambia a "paid", marcar paidAt
    if (body.status === 'paid' && !updateData.paidAt) {
      updateData.paidAt = new Date()
    }
    // Si se cambia de "paid" a otro estado, limpiar paidAt
    if (body.status && body.status !== 'paid') {
      updateData.paidAt = null
    }

    // Recalcular amountDue si cambio totalAmount o isDeposit
    if (updateData.totalAmount !== undefined || updateData.isDeposit !== undefined) {
      const current = await db.invoice.findUnique({ where: { id } })
      if (current) {
        const total = (updateData.totalAmount as number) ?? current.totalAmount
        const isDeposit = updateData.isDeposit !== undefined ? (updateData.isDeposit as boolean) : current.isDeposit
        updateData.amountDue = isDeposit ? total * 0.5 : total
      }
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate as string)
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

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
    await db.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
