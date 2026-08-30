// Componente reutilizable del logo de Platinum Construction Cleaning
// Usa <img> nativo (no next/image) para evitar artefactos de optimizacion
// que crean un "caja" oscura detras del logo transparente.
'use client'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function Logo({ className = '', variant = 'full' }: LogoProps) {
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

  // Logo completo - usa <img> nativo para preservar transparencia perfecta
  return (
    <img
      src="/platinum-logo.png"
      alt="Platinum Construction Cleaning"
      className={`h-auto w-full object-contain ${className}`}
      style={{ background: 'transparent' }}
    />
  )
}
