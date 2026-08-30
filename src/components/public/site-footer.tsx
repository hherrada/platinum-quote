import Link from 'next/link'
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold">Platinum Construction Cleaning</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Professional post-construction cleaning services for residential
              and commercial properties throughout Florida.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Services</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Rough Clean</li>
              <li>Final Clean</li>
              <li>Debris Removal</li>
              <li>Window Sticker Removal</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> (305) 555-0192
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@platinumcleaning.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Miami, FL &amp; surrounding areas
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Platinum Construction Cleaning. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-foreground">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
