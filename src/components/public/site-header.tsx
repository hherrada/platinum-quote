'use client'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              Platinum Construction Cleaning
            </span>
            <span className="text-[11px] text-muted-foreground">
              Florida&apos;s Post-Construction Cleaning Experts
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#calculator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Get Estimate
          </a>
          <a href="#services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Services
          </a>
          <a href="#why-us" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Why Us
          </a>
          <Link
            href="/admin/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Staff Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
