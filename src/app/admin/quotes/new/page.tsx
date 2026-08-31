'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  ArrowLeft,
  Info,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function NewQuotePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Datos del proyecto
  const [propertyType, setPropertyType] = useState<PropertyType>('residential')
  const [sqft, setSqft] = useState<string>('')
  const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>('final')
  const [hasDebris, setHasDebris] = useState(false)
  const [hasStickers, setHasStickers] = useState(false)

  // Datos del cliente (obligatorios en manual)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [notes, setNotes] = useState('')

  const [estimate, setEstimate] = useState<PriceRange | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Validacion antes de guardar
  function validate(): string | null {
    const sqftNum = parseInt(sqft, 10)
    if (!sqftNum || sqftNum <= 0) return 'Please enter a valid square footage.'
    if (!customerName.trim()) return 'Please enter the customer name.'
    if (!customerEmail.trim()) return 'Please enter the customer email.'
    if (!customerPhone.trim()) return 'Please enter the customer phone.'
    if (!projectAddress.trim()) return 'Please enter the project address.'
    return null
  }

  async function handleSave() {
    const error = validate()
    if (error) {
      toast({
        title: 'Missing information',
        description: error,
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType,
          sqft: parseInt(sqft, 10),
          cleaningLevel,
          hasDebris,
          hasStickers,
          source: 'manual',
          customerName,
          customerEmail,
          customerPhone,
          projectAddress,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Quote created',
        description: 'Redirecting to quote detail...',
      })
      router.push(`/admin/quotes/${data.quote.id}`)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to create quote',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/admin">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New Manual Quote</h1>
        <p className="text-sm text-muted-foreground">
          Fill in all the project and customer details below. The estimate will be calculated automatically when you save.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: formularios */}
        <div className="space-y-6 lg:col-span-2">
          {/* Datos del proyecto */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" /> Project Details
              </CardTitle>
              <CardDescription>
                Enter the project information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tipo de propiedad */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Property Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPropertyType('residential')}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      propertyType === 'residential'
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">Residential</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType('commercial')}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      propertyType === 'commercial'
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Commercial</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Footage (SQFT) <span className="text-destructive">*</span></Label>
                  <Input
                    id="sqft"
                    type="number"
                    min="1"
                    placeholder="e.g. 2500"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cleaning Level</Label>
                  <RadioGroup
                    value={cleaningLevel}
                    onValueChange={(v) => setCleaningLevel(v as CleaningLevel)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 text-sm transition-all ${
                        cleaningLevel === 'rough'
                          ? 'border-primary bg-secondary'
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="rough" id="r-rough" />
                      Rough
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 text-sm transition-all ${
                        cleaningLevel === 'final'
                          ? 'border-primary bg-secondary'
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="final" id="r-final" />
                      Final
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 text-sm transition-all ${
                        cleaningLevel === 'both'
                          ? 'border-primary bg-secondary'
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="both" id="r-both" />
                      Both
                    </label>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                    hasDebris ? 'border-primary bg-secondary' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasDebris}
                    onChange={(e) => setHasDebris(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-medium">Debris Removal</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                    hasStickers ? 'border-primary bg-secondary' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasStickers}
                    onChange={(e) => setHasStickers(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-medium">Window Stickers</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Datos del cliente */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Customer Information
              </CardTitle>
              <CardDescription>
                Required for manual quotes and PDF generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name" className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-name"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-phone"
                    placeholder="(305) 555-0100"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email" className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-addr" className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Project Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-addr"
                    placeholder="123 Main St, Miami, FL"
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this quote..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: resumen y boton de guardar al final */}
        <div className="space-y-4">
          <Card className="sticky top-20 border-primary/30 bg-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Summary
              </CardTitle>
              <CardDescription>
                Review the details and save to generate the PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Property</dt>
                  <dd className="font-medium capitalize">{propertyType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Level</dt>
                  <dd className="font-medium">
                    {cleaningLevel === 'both' ? 'Rough + Final' : cleaningLevel.charAt(0).toUpperCase() + cleaningLevel.slice(1)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">SQFT</dt>
                  <dd className="font-medium tabular-nums">
                    {parseInt(sqft || '0').toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Debris</dt>
                  <dd className="font-medium">{hasDebris ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stickers</dt>
                  <dd className="font-medium">{hasStickers ? 'Yes' : 'No'}</dd>
                </div>
                {customerName && (
                  <div className="flex justify-between border-t border-border/60 pt-1.5">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="font-medium">{customerName}</dd>
                  </div>
                )}
              </dl>

              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This estimate is referential and subject to visual inspection on
                  site.
                </AlertDescription>
              </Alert>

              {/* Boton de guardar al FINAL - despues de todos los datos */}
              <Button
                onClick={handleSave}
                disabled={submitting}
                className="w-full bg-platinum-primary text-platinum-bright hover:opacity-90"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Calculate &amp; Save Quote
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                The estimate will be calculated automatically on save
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
