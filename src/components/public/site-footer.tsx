import Link from 'next/link'
import { Logo } from './logo'
import { Phone, Mail, MapPin, User } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-platinum-primary text-platinum">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo + descripcion */}
          <div className="md:col-span-1">
            <Logo className="w-44" />
            <p className="mt-4 text-sm text-platinum">
              Professional post-construction cleaning services for residential
              and commercial properties throughout Florida.
            </p>
            <p className="mt-3 inline-block rounded-md border border-platinum/30 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-platinum-bright">
              ★ State of Florida Licensed &amp; Insured
            </p>
          </div>

          {/* Contacto directo - Maria Roldan */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-platinum-bright">
              Your Point of Contact
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-platinum">
              <li className="flex items-center gap-2">
                <User className="h-4 w-4 text-platinum-bright" />
                <span className="font-semibold text-platinum-bright">Maria Roldan</span>
              </li>
              <li className="text-xs text-platinum/80">Project Manager</li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-platinum-bright" />
                <a href="tel:+17865127353" className="hover:text-platinum-bright">
                  (786) 512-7353
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-platinum-bright" />
                <a href="mailto:maria@platinumcleaning.com" className="hover:text-platinum-bright break-all">
                  maria@platinumcleaning.com
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-platinum-bright">Services</h3>
            <ul className="mt-3 space-y-2 text-sm text-platinum">
              <li>Rough Clean</li>
              <li>Final Clean</li>
              <li>Debris Removal</li>
              <li>Window Sticker Removal</li>
            </ul>
          </div>

          {/* Oficina */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-platinum-bright">Office</h3>
            <ul className="mt-3 space-y-2 text-sm text-platinum">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-platinum-bright" /> (305) 555-0192
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-platinum-bright" /> info@platinumcleaning.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-platinum-bright" /> Miami, FL &amp; surrounding areas
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
