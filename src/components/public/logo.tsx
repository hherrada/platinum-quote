// Componente reutilizable del logo de Platinum Construction Cleaning
// Usa <img> nativo (no next/image) para evitar artefactos de optimizacion
// que crean un "caja" oscura detras del logo transparente.
// El tamano se controla con height prop (en px) para garantizar que se respete.
'use client'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
  /** Altura en pixels (ej: 36 para h-9, 48 para h-12, 64 para h-16) */
  height?: number
}

export function Logo({ className = '', variant = 'full', height = 36 }: LogoProps) {
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

  // Logo completo - usa <img> nativo con altura y ancho controlados via inline style.
  // Inline styles tienen la mayor especificidad, garantizando que el logo
  // no crezca a su tamano natural (1200x375).
  return (
    <img
      src="/platinum-logo.png"
      alt="Platinum Construction Cleaning"
      className={`object-contain ${className}`}
      style={{
        background: 'transparent',
        height: `${height}px`,
        width: 'auto',
        maxWidth: 'none',
      }}
    />
  )
}
