// Script de seed: pobla la matriz de precios, servicios adicionales y un admin demo
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Limpieza previa (orden por FK logic)
  await db.additionalService.deleteMany()
  await db.pricingMatrix.deleteMany()
  await db.quote.deleteMany()
  await db.profile.deleteMany()

  // --- Matriz de precios por SQFT (datos realistas para Florida) ---
  const pricing = [
    // Residencial
    { propertyType: 'residential', cleaningLevel: 'rough', minRatePerSqft: 0.15, maxRatePerSqft: 0.22 },
    { propertyType: 'residential', cleaningLevel: 'final', minRatePerSqft: 0.2, maxRatePerSqft: 0.3 },
    // Comercial
    { propertyType: 'commercial', cleaningLevel: 'rough', minRatePerSqft: 0.18, maxRatePerSqft: 0.25 },
    { propertyType: 'commercial', cleaningLevel: 'final', minRatePerSqft: 0.25, maxRatePerSqft: 0.35 },
  ]
  for (const p of pricing) {
    await db.pricingMatrix.create({ data: p })
  }

  // --- Servicios adicionales ---
  await db.additionalService.create({
    data: { key: 'debris', label: 'Debris Removal', minPrice: 75, maxPrice: 250 },
  })
  await db.additionalService.create({
    data: { key: 'stickers', label: 'Window Sticker Removal', minPrice: 50, maxPrice: 150 },
  })

  // --- Admin demo ---
  const hashed = await bcrypt.hash('admin123', 10)
  await db.profile.create({
    data: {
      email: 'admin@platinumcleaning.com',
      name: 'Platinum Admin',
      password: hashed,
      role: 'admin',
    },
  })

  console.log('Seed completado:')
  console.log(' - Admin: admin@platinumcleaning.com / admin123')
  console.log(' - Matriz de precios poblada (4 combinaciones)')
  console.log(' - Servicios adicionales: debris, stickers')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
