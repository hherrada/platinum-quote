import Link from 'next/link'
import { Logo } from './logo'
import { Phone, Mail, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-platinum-primary text-platinum">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo className="w-44" />
            <p className="mt-4 text-sm text-platinum">
              Professional post-construction cleaning services for residential
              and commercial properties throughout Florida.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-platinum-bright">Services</h3>
            <ul className="mt-3 space-y-2 text-sm text-platinum">
              <li>Rough Clean</li>
              <li>Final Clean</li>
              <li>Debris Removal</li>
              <li>Window Sticker Removal</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-platinum-bright">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-platinum">
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
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-platinum sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Platinum Construction Cleaning. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-platinum-bright">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
