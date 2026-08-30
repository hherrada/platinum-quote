// Componente reutilizable del logo de Platinum Construction Cleaning
// Usa la imagen real del logo con fondo navy
import Image from 'next/image'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon' // full = logo completo, icon = solo el bloque
  showText?: boolean
}

export function Logo({ className = '', variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    // Icono cuadrado con fondo navy y letra P estilizada
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-platinum-primary ${className}`}
        style={{ minWidth: '2.25rem', minHeight: '2.25rem' }}
      >
        <span className="text-lg font-bold text-platinum-bright">P</span>
      </div>
    )
  }

  // Logo completo con imagen real
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/platinum-logo.png"
        alt="Platinum Construction Cleaning"
        width={220}
        height={69}
        className="h-auto w-full object-contain"
        priority
      />
    </div>
  )
}
