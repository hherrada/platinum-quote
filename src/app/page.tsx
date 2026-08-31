import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { QuoteCalculator } from '@/components/public/quote-calculator'
import { Logo } from '@/components/public/logo'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  HardHat,
  Wind,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Wrench,
  Droplets,
  ScanLine,
  Sparkles,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero - fondo navy con logo */}
      <section className="relative overflow-hidden bg-platinum-radial">
        {/* Linea separadora platinum */}
        <div className="platinum-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <Logo className="drop-shadow-2xl" height={96} />
            </div>
            <Badge
              variant="secondary"
              className="mb-4 border-platinum/30 bg-white/10 text-platinum-bright backdrop-blur"
            >
              <Sparkles className="mr-1 h-3 w-3" /> Serving All of Florida
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-platinum-bright sm:text-5xl md:text-6xl">
              Spotless Results After{' '}
              <span className="bg-gradient-to-r from-white via-platinum-bright to-white bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(232,236,240,0.35)]">
                Construction
              </span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-platinum">
              Professional post-construction cleaning for residential and
              commercial properties. From rough cleans to final detailing — get an
              instant estimate in seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#calculator"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-platinum-primary border border-platinum/40 px-8 text-sm font-semibold text-platinum-bright shadow-lg transition-all hover:bg-[#2a3850]"
              >
                Get My Free Estimate
              </a>
              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-platinum/30 bg-white/5 px-8 text-sm font-semibold text-platinum-bright backdrop-blur transition-colors hover:bg-white/10"
              >
                Learn About Our Services
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-platinum">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-platinum-bright" /> Licensed &amp; Insured
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-platinum-bright" /> 24-Hour Response
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-platinum-bright" /> Florida Wide
              </span>
            </div>
          </div>
        </div>
        <div className="platinum-divider absolute bottom-0 left-0 right-0" />
      </section>

      {/* Calculadora */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Get Your Estimate by Email
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fill in your contact details and project info. Your estimate will be
              sent to your email immediately.
            </p>
          </div>
          <QuoteCalculator />
        </div>
      </section>

      {/* Servicios */}
      <section id="services" className="border-t border-border/60 bg-secondary/20">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Our Cleaning Services</h2>
            <p className="mt-2 text-muted-foreground">
              Two specialized cleaning phases tailored to your construction stage.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-border/60 bg-secondary/20 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-platinum-primary">
                  <Wrench className="h-6 w-6 text-platinum-bright" />
                </div>
                <h3 className="text-xl font-bold text-primary">Rough Clean</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Performed during the construction process, after framing and
                  major work is done. Includes removal of large debris, sweeping,
                  dusting of surfaces, and preparing the space for the next phase.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Debris &amp; material removal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Surface dusting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Floor sweeping
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border/60 bg-secondary/20 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-platinum-primary">
                  <Droplets className="h-6 w-6 text-platinum-bright" />
                </div>
                <h3 className="text-xl font-bold text-primary">Final Clean</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The finishing clean performed once construction is fully
                  complete. Detailed cleaning of windows, floors, fixtures, and all
                  surfaces to make the property move-in ready.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Window cleaning inside &amp; out
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Floor detailing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Fixture &amp; hardware polishing
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Por que elegirnos */}
      <section id="why-us" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Why Choose Platinum</h2>
          <p className="mt-2 text-muted-foreground">
            Trusted by builders, contractors, and homeowners across Florida.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HardHat,
              title: 'Construction Experts',
              desc: 'Specialized crews trained for post-construction environments.',
            },
            {
              icon: ShieldCheck,
              title: 'Licensed & Insured',
              desc: 'Fully bonded and insured for your peace of mind.',
            },
            {
              icon: ScanLine,
              title: 'Detailed Inspection',
              desc: 'Every quote verified with an on-site visual inspection.',
            },
            {
              icon: Wind,
              title: 'Eco-Friendly',
              desc: 'Safe, non-toxic cleaning products for every project.',
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-border/60 bg-secondary/30 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-platinum-primary">
                  <feature.icon className="h-5 w-5 text-platinum-bright" />
                </div>
                <h3 className="font-semibold text-primary">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-platinum-gradient">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-platinum-bright sm:text-3xl">
            Ready for a Spotless Finish?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-platinum">
            Get your free estimate today. No commitment required — our team is
            ready to inspect your property.
          </p>
          <a
            href="#calculator"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-platinum-bright"
          >
            Get My Estimate
          </a>
        </div>
        {/* Linea separadora platinum entre CTA y footer */}
        <div className="platinum-divider" />
      </section>

      <SiteFooter />
    </div>
  )
}
