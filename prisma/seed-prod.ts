// Script de seed para produccion (Supabase/PostgreSQL)
// Crea el usuario admin y pobla la matriz de precios y servicios adicionales
// Se ejecuta con: bun prisma/seed-prod.ts
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Inicializando base de datos de produccion...')

  // Limpieza previa (en orden por dependencias)
  await db.additionalService.deleteMany()
  await db.pricingMatrix.deleteMany()
  await db.quote.deleteMany()
  await db.profile.deleteMany()
  console.log('   ✓ Tablas limpiadas')

  // --- Matriz de precios por SQFT (datos realistas para Florida) ---
  const pricing = [
    { propertyType: 'residential', cleaningLevel: 'rough', minRatePerSqft: 0.15, maxRatePerSqft: 0.22 },
    { propertyType: 'residential', cleaningLevel: 'final', minRatePerSqft: 0.2, maxRatePerSqft: 0.3 },
    { propertyType: 'commercial', cleaningLevel: 'rough', minRatePerSqft: 0.18, maxRatePerSqft: 0.25 },
    { propertyType: 'commercial', cleaningLevel: 'final', minRatePerSqft: 0.25, maxRatePerSqft: 0.35 },
  ]
  for (const p of pricing) {
    await db.pricingMatrix.create({ data: p })
  }
  console.log('   ✓ Matriz de precios poblada (4 combinaciones)')

  // --- Servicios adicionales ---
  await db.additionalService.create({
    data: { key: 'debris', label: 'Debris Removal', minPrice: 75, maxPrice: 250 },
  })
  await db.additionalService.create({
    data: { key: 'stickers', label: 'Window Sticker Removal', minPrice: 50, maxPrice: 150 },
  })
  console.log('   ✓ Servicios adicionales creados (debris, stickers)')

  // --- Admin ---
  const hashed = await bcrypt.hash('admin123', 10)
  await db.profile.create({
    data: {
      email: 'admin@platinumcleaning.com',
      name: 'Platinum Admin',
      password: hashed,
      role: 'admin',
    },
  })
  console.log('   ✓ Usuario admin creado: admin@platinumcleaning.com / admin123')

  console.log('\n✅ Base de datos de produccion inicializada correctamente')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
