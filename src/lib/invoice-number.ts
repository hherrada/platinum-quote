// Helper para generar numeros de invoice correlativos (INV-2026-001, INV-2026-002, ...)
import { db } from './db'

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  // Buscar la ultima invoice del anio actual
  const lastInvoice = await db.invoice.findFirst({
    where: {
      number: { startsWith: `INV-${year}-` },
    },
    orderBy: { number: 'desc' },
  })

  let nextNumber = 1
  if (lastInvoice) {
    const parts = lastInvoice.number.split('-')
    const lastSeq = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1
    }
  }

  // Formato: INV-2026-001 (rellenar con ceros a 3 digitos)
  return `INV-${year}-${String(nextNumber).padStart(3, '0')}`
}
