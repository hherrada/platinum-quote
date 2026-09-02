// API para enviar invoice por email con PDF adjunto
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvoicePDF } from '@/components/admin/invoice-pdf'
import { renderToBuffer } from '@react-pdf/renderer'
import { sendInvoiceEmail, isEmailConfigured } from '@/lib/email'

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
        error: 'Email not configured. Set RESEND_API_KEY environment variable.',
      }, { status: 500 })
    }

    const { id } = await params
    const body = await req.json()
    const { to } = body
    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

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

    const pdfBuffer = await renderToBuffer(<InvoicePDF data={pdfData} />)

    await sendInvoiceEmail({
      to,
      customerName: invoice.customerName || 'Valued Customer',
      invoiceNumber: invoice.number,
      totalAmount: invoice.totalAmount,
      amountDue: invoice.amountDue,
      isDeposit: invoice.isDeposit,
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      propertyType: invoice.propertyType,
      cleaningLevel: invoice.cleaningLevel,
      sqft: invoice.sqft,
      attachment: {
        filename: `${invoice.number}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
      },
    })

    // Marcar como enviado si estaba en draft
    if (invoice.status === 'draft') {
      await db.invoice.update({
        where: { id },
        data: { status: 'sent', sentAt: new Date() },
      })
    }

    return NextResponse.json({ success: true, message: `Invoice sent to ${to}` })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    const message = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
