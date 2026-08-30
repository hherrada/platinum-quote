// Componente reutilizable del logo de Platinum Construction Cleaning
// Usa <img> nativo (no next/image) para evitar artefactos de optimizacion
// que crean un "caja" oscura detras del logo transparente.
'use client'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
  /** Altura explicita en px o clase tailwind (ej: "h-8", "h-10") para limitar el logo */
  heightClass?: string
}

export function Logo({ className = '', variant = 'full', heightClass }: LogoProps) {
  if (variant === 'icon') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-platinum-primary ${className}`}
        style={{ minWidth: '2.25rem', minHeight: '2.25rem' }}
      >
        <span className="text-lg font-bold text-platinum-bright">P</span>
      </div>
    )
  }

  // Logo completo - usa <img> nativo con altura controlada para preservar transparencia
  // y evitar que crezca mas alla del contenedor del header.
  return (
    <img
      src="/platinum-logo.png"
      alt="Platinum Construction Cleaning"
      className={`h-auto w-auto object-contain ${heightClass ?? ''} ${className}`}
      style={{ background: 'transparent', maxWidth: 'none' }}
    />
  )
}
