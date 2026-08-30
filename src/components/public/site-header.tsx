'use client'
import Link from 'next/link'
import { Logo } from './logo'
import { Phone } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-platinum/15 bg-platinum-primary shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Logo className="w-44 sm:w-52" heightClass="h-10" />
        </Link>

        {/* Contacto directo de Maria Roldan - visible en desktop */}
        <a
          href="tel:+17865127353"
          className="hidden items-center gap-2.5 rounded-lg border border-platinum/30 bg-white/5 px-3 py-2 text-platinum-bright transition-colors hover:bg-white/10 lg:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Phone className="h-4 w-4 text-platinum-bright" />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] uppercase tracking-wide text-platinum">
              Project Manager
            </span>
            <span className="block text-sm font-semibold text-platinum-bright">
              Maria Roldan · (786) 512-7353
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#calculator" className="text-sm font-medium text-platinum transition-colors hover:text-platinum-bright">
            Get Estimate
          </a>
          <a href="#services" className="text-sm font-medium text-platinum transition-colors hover:text-platinum-bright">
            Services
          </a>
          <a href="#why-us" className="text-sm font-medium text-platinum transition-colors hover:text-platinum-bright">
            Why Us
          </a>
          <Link
            href="/admin/login"
            className="rounded-md border border-platinum/40 px-3 py-1.5 text-sm font-medium text-platinum-bright transition-colors hover:bg-white/10"
          >
            Staff Login
          </Link>
        </nav>

        {/* Telefono compacto en mobile */}
        <a
          href="tel:+17865127353"
          className="flex items-center gap-1.5 text-platinum-bright md:hidden"
        >
          <Phone className="h-4 w-4" />
          <span className="text-xs font-semibold">(786) 512-7353</span>
        </a>
      </div>
    </header>
  )
}
