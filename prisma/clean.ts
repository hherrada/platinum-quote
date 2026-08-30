// Script de limpieza: elimina todas las cotizaciones de prueba
// Mantiene el usuario admin y la matriz de precios
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🧹 Limpiando base de datos...')

  // Eliminar todas las cotizaciones de prueba
  const deletedQuotes = await db.quote.deleteMany({})
  console.log(`   ✓ ${deletedQuotes.count} cotizaciones eliminadas`)

  // Verificar que el admin existe, si no, crearlo
  const adminCount = await db.profile.count()
  if (adminCount === 0) {
    const hashed = await bcrypt.hash('admin123', 10)
    await db.profile.create({
      data: {
        email: 'admin@platinumcleaning.com',
        name: 'Platinum Admin',
        password: hashed,
        role: 'admin',
      },
    })
    console.log('   ✓ Admin recreado (admin@platinumcleaning.com / admin123)')
  } else {
    console.log(`   ✓ Admin existente mantenido (${adminCount} usuario(s))`)
  }

  // Verificar que la matriz de precios existe
  const pricingCount = await db.pricingMatrix.count()
  if (pricingCount === 0) {
    // Re-poblar la matriz de precios si esta vacia
    const pricing = [
      { propertyType: 'residential', cleaningLevel: 'rough', minRatePerSqft: 0.15, maxRatePerSqft: 0.22 },
      { propertyType: 'residential', cleaningLevel: 'final', minRatePerSqft: 0.2, maxRatePerSqft: 0.3 },
      { propertyType: 'commercial', cleaningLevel: 'rough', minRatePerSqft: 0.18, maxRatePerSqft: 0.25 },
      { propertyType: 'commercial', cleaningLevel: 'final', minRatePerSqft: 0.25, maxRatePerSqft: 0.35 },
    ]
    for (const p of pricing) {
      await db.pricingMatrix.create({ data: p })
    }
    console.log('   ✓ Matriz de precios repoblada (4 combinaciones)')
  } else {
    console.log(`   ✓ Matriz de precios mantenida (${pricingCount} combinaciones)`)
  }

  // Verificar servicios adicionales
  const servicesCount = await db.additionalService.count()
  if (servicesCount === 0) {
    await db.additionalService.create({
      data: { key: 'debris', label: 'Debris Removal', minPrice: 75, maxPrice: 250 },
    })
    await db.additionalService.create({
      data: { key: 'stickers', label: 'Window Sticker Removal', minPrice: 50, maxPrice: 150 },
    })
    console.log('   ✓ Servicios adicionales repoblados (debris, stickers)')
  } else {
    console.log(`   ✓ Servicios adicionales mantenidos (${servicesCount} servicios)`)
  }

  console.log('\n✅ Base de datos limpia y lista para produccion')
  console.log('   - Cotizaciones: 0 (limpias)')
  console.log('   - Admin: admin@platinumcleaning.com / admin123')
  console.log('   - Matriz de precios: configurada')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
