'use client'
import Link from 'next/link'
import { Logo } from './logo'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-platinum-primary shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="w-44 sm:w-52" />
        </Link>
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
      </div>
    </header>
  )
}
