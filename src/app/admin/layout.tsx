'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FilePlus2,
  Settings2,
  LogOut,
  Loader2,
  Phone,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/public/logo'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/quotes/new', label: 'New Quote', icon: FilePlus2 },
  { href: '/admin/pricing', label: 'Pricing Matrix', icon: Settings2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return children
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-platinum-radial">
        <Loader2 className="h-8 w-8 animate-spin text-platinum-bright" />
      </div>
    )
  }

  if (!session) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      {/* Top bar - navy */}
      <header className="sticky top-0 z-40 border-b border-platinum/10 bg-platinum-primary shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo height={36} />
            <span className="ml-2 hidden rounded-md border border-platinum/30 px-2 py-0.5 text-xs font-medium text-platinum-bright sm:inline">
              ADMIN
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Contacto directo Maria Roldan */}
            <a
              href="tel:+17865127353"
              className="hidden items-center gap-2 rounded-lg border border-platinum/30 bg-white/5 px-3 py-1.5 text-platinum-bright transition-colors hover:bg-white/10 md:flex"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="leading-tight">
                <span className="block text-[9px] uppercase tracking-wide text-platinum">
                  Project Manager
                </span>
                <span className="block text-xs font-semibold">
                  Maria Roldan · (786) 512-7353
                </span>
              </span>
            </a>
            <div className="hidden text-right text-xs sm:block">
              <p className="font-medium text-platinum-bright">{session.user?.name}</p>
              <p className="text-platinum">{session.user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="border-platinum/30 bg-white/5 text-platinum-bright hover:bg-white/10 hover:text-platinum-bright"
            >
              <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - navy */}
        <aside className="hidden w-60 shrink-0 border-r border-platinum/10 bg-platinum-primary md:block">
          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/15 text-platinum-bright'
                      : 'text-platinum hover:bg-white/10 hover:text-platinum-bright'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          {/* Linea platinum en el fondo del sidebar */}
          <div className="platinum-divider mx-3 mt-4" />
          <div className="p-3">
            <p className="text-xs text-platinum/60">Platinum Construction</p>
            <p className="text-xs text-platinum/60">Cleaning · Florida</p>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="flex w-full flex-col">
          <nav className="flex gap-1 border-b border-border/60 bg-background px-2 py-2 md:hidden">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
