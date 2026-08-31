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
  ShieldCheck,
  Mail,
  Phone,
  User,
  MapPin,
  Info,
  AlertTriangle,
  CheckCircle2,
  Send,
} from 'lucide-react'

type PropertyType = 'residential' | 'commercial'
type CleaningLevel = 'rough' | 'final' | 'both'

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
    levels: string[]
  }
}

interface SavedQuote {
  id: string
  minPrice: number
  maxPrice: number
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

  // --- Datos de contacto (arriba) ---
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')

  // --- Datos del proyecto ---
  const [propertyType, setPropertyType] = useState<PropertyType>('residential')
  const [sqft, setSqft] = useState<string>('')
  const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>('final')
  const [hasDebris, setHasDebris] = useState<boolean>(false)
  const [hasStickers, setHasStickers] = useState<boolean>(false)

  const [estimate, setEstimate] = useState<PriceRange | null>(null)
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function validateForm(): string | null {
    if (!firstName.trim()) return 'Please enter your first name.'
    if (!lastName.trim()) return 'Please enter your last name.'
    if (!email.trim()) return 'Please enter your email address.'
    // Validacion simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address.'
    if (email !== emailConfirm) return 'Email addresses do not match. Please verify carefully.'
    const sqftNum = parseInt(sqft, 10)
    if (!sqftNum || sqftNum <= 0) return 'Please enter a valid square footage.'
    return null
  }

  async function handleSubmit() {
    const error = validateForm()
    if (error) {
      toast({
        title: 'Check your information',
        description: error,
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const customerName = `${firstName.trim()} ${lastName.trim()}`
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
          customerEmail: email.trim(),
          // El telefono y direccion se pediran despues en la inspeccion
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')

      setEstimate(data.priceRange)
      setSavedQuote({ id: data.quote.id, minPrice: data.quote.minPrice, maxPrice: data.quote.maxPrice })
      setDone(true)
      toast({
        title: 'Estimate ready!',
        description: `Your estimate has been sent to ${email}`,
      })
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
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
    setFirstName('')
    setLastName('')
    setEmail('')
    setEmailConfirm('')
    setSqft('')
    setHasDebris(false)
    setHasStickers(false)
    setEstimate(null)
    setSavedQuote(null)
    setDone(false)
    router.refresh()
  }

  // ===== PANTALLA DE RESULTADO =====
  if (done && estimate && savedQuote) {
    return (
      <Card id="result-section" className="border-primary/30 bg-secondary/30 shadow-lg">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="h-8 w-8 text-platinum-bright" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-primary">Your Estimate is Ready!</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              We&apos;ve sent your detailed estimate to{' '}
              <strong className="text-primary">{email}</strong>. Check your inbox in the next 2 minutes.
            </p>
          </div>
          <div className="rounded-xl border-2 border-primary/20 bg-white px-8 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estimated Range
            </p>
            <p className="mt-1 text-4xl font-bold text-primary">
              {formatCurrency(savedQuote.minPrice)} –{' '}
              {formatCurrency(savedQuote.maxPrice)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {propertyType === 'residential' ? 'Residential' : 'Commercial'}{' '}
              {cleaningLevel === 'both' ? 'Rough + Final' : cleaningLevel === 'rough' ? 'Rough' : 'Final'} Clean · {parseInt(sqft).toLocaleString()} SQFT
            </p>
          </div>
          <Alert className="border-amber-300 bg-amber-50 text-amber-900 max-w-md">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm text-left">
              <strong>What&apos;s next?</strong> Our Project Manager{' '}
              <strong>Maria Roldan</strong> will contact you within 24 hours to
              schedule your free on-site inspection. Call her directly at{' '}
              <a href="tel:+17865127353" className="font-bold underline">
                (786) 512-7353
              </a>{' '}
              if you need immediate assistance.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={resetForm}>
            Calculate Another Estimate
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ===== FORMULARIO =====
  return (
    <div className="space-y-6">
      <Card id="calculator" className="border-border/60 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle>Get Your Estimate by Email</CardTitle>
          </div>
          <CardDescription>
            Fill in your contact details and project info below. Your estimate will
            be calculated and sent to your email immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ===== DATOS DE CONTACTO (arriba) ===== */}
          <div className="rounded-xl border-2 border-primary/20 bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-primary uppercase tracking-wide">
                Your Contact Information
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailConfirm" className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Confirm Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emailConfirm"
                type="email"
                placeholder="john@example.com"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                className={emailConfirm && email !== emailConfirm ? 'border-destructive' : ''}
              />
            </div>

            <Alert className="border-primary/30 bg-primary/5">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-primary">
                <strong>Important:</strong> Please verify your email carefully.
                Your detailed quote will be sent to this address within 2 minutes.
              </AlertDescription>
            </Alert>
          </div>

          {/* ===== DATOS DEL PROYECTO ===== */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-primary uppercase tracking-wide">
                Project Details
              </h3>
            </div>

            {/* Tipo de propiedad */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Property Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyType('residential')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    propertyType === 'residential'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
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
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
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
                Square Footage (SQFT) <span className="text-destructive">*</span>
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
                className="grid gap-3 sm:grid-cols-3"
              >
                <label
                  htmlFor="rough"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                    cleaningLevel === 'rough'
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="rough" id="rough" className="mt-1" />
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold">Rough Clean</span>
                    <span className="block text-xs text-muted-foreground">
                      Initial cleaning during construction.
                    </span>
                  </div>
                </label>
                <label
                  htmlFor="final"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                    cleaningLevel === 'final'
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="final" id="final" className="mt-1" />
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold">Final Clean</span>
                    <span className="block text-xs text-muted-foreground">
                      Finishing clean after construction.
                    </span>
                  </div>
                </label>
                <label
                  htmlFor="both"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                    cleaningLevel === 'both'
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="both" id="both" className="mt-1" />
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold">Both</span>
                    <span className="block text-xs text-muted-foreground">
                      Rough + Final clean combined.
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
                    hasDebris ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasDebris}
                    onChange={(e) => setHasDebris(e.target.checked)}
                    className="h-4 w-4 accent-primary"
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
                    hasStickers ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasStickers}
                    onChange={(e) => setHasStickers(e.target.checked)}
                    className="h-4 w-4 accent-primary"
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
          </div>

          {/* Disclaimer */}
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Legal Disclaimer:</strong> This is a referential estimate
              subject to visual inspection on site. Final pricing may vary based
              on actual site conditions. No price is final without an on-site
              inspection.
            </AlertDescription>
          </Alert>

          {/* CTA principal */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-platinum-primary text-platinum-bright hover:opacity-90"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending to your email...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Email Me My Estimate
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Your estimate will arrive in your inbox within 2 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
