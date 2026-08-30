'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Home,
  Building2,
  Loader2,
  Calculator,
  ShieldCheck,
  CalendarCheck,
  Mail,
  Phone,
  User,
  MapPin,
  Info,
} from 'lucide-react'

type PropertyType = 'residential' | 'commercial'
type CleaningLevel = 'rough' | 'final'

interface PriceRange {
  minPrice: number
  maxPrice: number
  breakdown: {
    baseMin: number
    baseMax: number
    debrisMin: number
    debrisMax: number
    stickersMin: number
    stickersMax: number
    rateMin: number
    rateMax: number
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function QuoteCalculator() {
  const router = useRouter()
  const { toast } = useToast()

  // --- Step 1: project data ---
  const [propertyType, setPropertyType] = useState<PropertyType>('residential')
  const [sqft, setSqft] = useState<string>('')
  const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>('final')
  const [hasDebris, setHasDebris] = useState<boolean>(false)
  const [hasStickers, setHasStickers] = useState<boolean>(false)

  // --- Step 2: estimate result ---
  const [estimate, setEstimate] = useState<PriceRange | null>(null)
  const [calculating, setCalculating] = useState(false)

  // --- Step 3: schedule inspection ---
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleCalculate() {
    const sqftNum = parseInt(sqft, 10)
    if (!sqftNum || sqftNum <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a valid square footage.',
        variant: 'destructive',
      })
      return
    }
    setCalculating(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType,
          sqft: sqftNum,
          cleaningLevel,
          hasDebris,
          hasStickers,
          source: 'web',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to calculate estimate')
      }
      setEstimate(data.priceRange)
      toast({
        title: 'Estimate ready',
        description: `Estimated range: ${formatCurrency(data.priceRange.minPrice)} - ${formatCurrency(data.priceRange.maxPrice)}`,
      })
      // Scroll a la seccion de la estimacion
      setTimeout(() => {
        document.getElementById('estimate-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setCalculating(false)
    }
  }

  async function handleSchedule() {
    if (!estimate) return
    if (!customerName || !customerPhone || !customerEmail || !projectAddress) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields to schedule the inspection.',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      // Recrear la cotizacion con datos del cliente (la primera se creo sin cliente)
      // En lugar de eso, actualizamos: creamos una nueva entrada completa
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType,
          sqft: parseInt(sqft, 10),
          cleaningLevel,
          hasDebris,
          hasStickers,
          source: 'web',
          customerName,
          customerEmail,
          customerPhone,
          projectAddress,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setSaved(true)
      toast({
        title: 'Inspection scheduled!',
        description: 'Our team will contact you within 24 hours.',
      })
      setTimeout(() => {
        document.getElementById('confirmation-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setEstimate(null)
    setSaved(false)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setProjectAddress('')
    setSqft('')
    setHasDebris(false)
    setHasStickers(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Formulario principal de cotizacion */}
      <Card id="calculator" className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <CardTitle>Instant Estimate Calculator</CardTitle>
          </div>
          <CardDescription>
            Enter your project details to get an estimated price range. All
            estimates are subject to a visual on-site inspection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de propiedad */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Property Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPropertyType('residential')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  propertyType === 'residential'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <Home className="h-6 w-6" />
                <span className="text-sm font-medium">Residential</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyType('commercial')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  propertyType === 'commercial'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium">Commercial</span>
              </button>
            </div>
          </div>

          {/* Metraje SQFT */}
          <div className="space-y-2">
            <Label htmlFor="sqft" className="text-sm font-semibold">
              Square Footage (SQFT)
            </Label>
            <Input
              id="sqft"
              type="number"
              min="1"
              placeholder="e.g. 2500"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the total area of the property in square feet.
            </p>
          </div>

          {/* Nivel de limpieza */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Cleaning Level</Label>
            <RadioGroup
              value={cleaningLevel}
              onValueChange={(v) => setCleaningLevel(v as CleaningLevel)}
              className="grid gap-3 sm:grid-cols-2"
            >
              <label
                htmlFor="rough"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                  cleaningLevel === 'rough'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <RadioGroupItem value="rough" id="rough" className="mt-1" />
                <div className="space-y-1">
                  <span className="block text-sm font-semibold">Rough Clean</span>
                  <span className="block text-xs text-muted-foreground">
                    Initial cleaning during construction: removal of large debris,
                    dust, and leftover materials.
                  </span>
                </div>
              </label>
              <label
                htmlFor="final"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                  cleaningLevel === 'final'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <RadioGroupItem value="final" id="final" className="mt-1" />
                <div className="space-y-1">
                  <span className="block text-sm font-semibold">Final Clean</span>
                  <span className="block text-xs text-muted-foreground">
                    Detailed finishing clean after construction is complete:
                    windows, floors, fixtures, and detailing.
                  </span>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Servicios adicionales */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Additional Services</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  hasDebris ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:border-emerald-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasDebris}
                  onChange={(e) => setHasDebris(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <div>
                  <span className="block text-sm font-medium">Debris Removal</span>
                  <span className="block text-xs text-muted-foreground">
                    Construction debris on site
                  </span>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  hasStickers ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:border-emerald-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasStickers}
                  onChange={(e) => setHasStickers(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <div>
                  <span className="block text-sm font-medium">Window Stickers</span>
                  <span className="block text-xs text-muted-foreground">
                    Stickers/labels on windows
                  </span>
                </div>
              </label>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            size="lg"
          >
            {calculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" /> Get My Estimate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado de la estimacion */}
      {estimate && !saved && (
        <Card id="estimate-section" className="border-emerald-200 bg-emerald-50/50 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <CardTitle>Your Estimated Price Range</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Estimate
              </Badge>
            </div>
            <CardDescription>
              Based on the details you provided. Final pricing confirmed after
              on-site inspection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rango de precio principal */}
            <div className="rounded-xl border border-emerald-200 bg-white p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Estimated Range for {sqft} SQFT
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-700 sm:text-5xl">
                {formatCurrency(estimate.minPrice)}
                <span className="mx-2 text-muted-foreground">–</span>
                {formatCurrency(estimate.maxPrice)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {propertyType === 'residential' ? 'Residential' : 'Commercial'}{' '}
                {cleaningLevel === 'rough' ? 'Rough' : 'Final'} Clean
              </p>
            </div>

            {/* Desglose */}
            <div className="rounded-lg border border-border/60 bg-white p-4">
              <h4 className="mb-3 text-sm font-semibold">Price Breakdown</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">
                    Base rate ({formatCurrency(estimate.breakdown.rateMin)}–
                    {formatCurrency(estimate.breakdown.rateMax)}/sqft × {sqft} sqft)
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(estimate.breakdown.baseMin)} –{' '}
                    {formatCurrency(estimate.breakdown.baseMax)}
                  </dd>
                </div>
                {hasDebris && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Debris removal</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(estimate.breakdown.debrisMin)} –{' '}
                      {formatCurrency(estimate.breakdown.debrisMax)}
                    </dd>
                  </div>
                )}
                {hasStickers && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Window sticker removal</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(estimate.breakdown.stickersMin)} –{' '}
                      {formatCurrency(estimate.breakdown.stickersMax)}
                    </dd>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                  <dt className="font-semibold">Total estimated range</dt>
                  <dd className="font-bold tabular-nums text-emerald-700">
                    {formatCurrency(estimate.minPrice)} –{' '}
                    {formatCurrency(estimate.maxPrice)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Disclaimer legal */}
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Legal Disclaimer:</strong> This is a referential estimate
                subject to visual inspection on site. Final pricing may vary based
                on actual site conditions. No price is final without an on-site
                inspection.
              </AlertDescription>
            </Alert>

            {/* Formulario para agendar inspeccion */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-white p-6">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-semibold">Schedule Your Free Inspection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Provide your contact details and our team will reach out within 24
                hours to schedule a visual inspection at your property.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cust-name" className="flex items-center gap-1.5 text-xs">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input
                    id="cust-name"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone" className="flex items-center gap-1.5 text-xs">
                    <Phone className="h-3 w-3" /> Phone Number
                  </Label>
                  <Input
                    id="cust-phone"
                    placeholder="(305) 555-0100"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-email" className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>
                  <Input
                    id="cust-email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-addr" className="flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3 w-3" /> Project Address
                  </Label>
                  <Input
                    id="cust-addr"
                    placeholder="123 Main St, Miami, FL"
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSchedule}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="mr-2 h-4 w-4" /> Schedule Inspection
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmacion */}
      {saved && (
        <Card id="confirmation-section" className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CalendarCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Inspection Request Received!</h3>
              <p className="text-sm text-muted-foreground">
                Thank you, {customerName.split(' ')[0]}. Our team will contact you
                at <strong>{customerPhone}</strong> within 24 hours to schedule your
                on-site inspection.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-white px-6 py-3 text-sm">
              <p className="text-muted-foreground">Your estimated range</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatCurrency(estimate!.minPrice)} –{' '}
                {formatCurrency(estimate!.maxPrice)}
              </p>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Calculate Another Estimate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
