// Cliente Prisma optimizado para serverless (Vercel)
// - En desarrollo: log de queries para debug
// - En produccion: sin logs para mejor rendimiento
// - Reutiliza la instancia global para evitar agotar conexiones en serverless
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
