// API para generar y descargar el PDF de una invoice
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvoicePDF } from '@/components/admin/invoice-pdf'
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
    const invoice = await db.invoice.findUnique({ where: { id } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const pdfData = {
      invoiceNumber: invoice.number,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      projectAddress: invoice.projectAddress,
      propertyType: invoice.propertyType,
      cleaningLevel: invoice.cleaningLevel,
      sqft: invoice.sqft,
      hasDebris: invoice.hasDebris,
      hasStickers: invoice.hasStickers,
      totalAmount: invoice.totalAmount,
      amountDue: invoice.amountDue,
      isDeposit: invoice.isDeposit,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      notes: invoice.notes,
    }

    const buffer = await renderToBuffer(<InvoicePDF data={pdfData} />)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
