import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { QuoteCalculator } from '@/components/public/quote-calculator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  HardHat,
  Wind,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Wrench,
  Droplets,
  ScanLine,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-emerald-200 bg-emerald-100 text-emerald-700"
            >
              <Sparkles className="mr-1 h-3 w-3" /> Serving All of Florida
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Spotless Results After{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Construction
              </span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              Professional post-construction cleaning for residential and
              commercial properties. From rough cleans to final detailing — get an
              instant estimate in seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#calculator"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700"
              >
                Get My Free Estimate
              </a>
              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Learn About Our Services
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Licensed &amp; Insured
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" /> 24-Hour Response
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600" /> Florida Wide
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Get Your Estimate
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fill out the form below to receive an estimated price range for your
              project.
            </p>
          </div>
          <QuoteCalculator />
        </div>
      </section>

      {/* Servicios */}
      <section id="services" className="border-t border-border/60 bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Our Cleaning Services</h2>
            <p className="mt-2 text-muted-foreground">
              Two specialized cleaning phases tailored to your construction stage.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-border/60">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold">Rough Clean</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Performed during the construction process, after framing and
                  major work is done. Includes removal of large debris, sweeping,
                  dusting of surfaces, and preparing the space for the next phase.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Debris &amp; material removal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Surface dusting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Floor sweeping
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border/60">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Droplets className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Final Clean</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The finishing clean performed once construction is fully
                  complete. Detailed cleaning of windows, floors, fixtures, and all
                  surfaces to make the property move-in ready.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Window cleaning inside &amp; out
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Floor detailing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Fixture &amp; hardware polishing
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
          <h2 className="text-3xl font-bold tracking-tight">Why Choose Platinum</h2>
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
            <Card key={feature.title} className="border-border/60">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <feature.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready for a Spotless Finish?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-emerald-50">
            Get your free estimate today. No commitment required — our team is
            ready to inspect your property.
          </p>
          <a
            href="#calculator"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
          >
            Get My Estimate
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
