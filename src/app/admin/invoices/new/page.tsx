'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Home,
  Building2,
  Loader2,
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Info,
  CheckCircle2,
} from 'lucide-react'

type PropertyType = 'residential' | 'commercial'
type CleaningLevel = 'rough' | 'final' | 'both'

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function NewInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quoteId')
  const { toast } = useToast()
  const [loadingQuote, setLoadingQuote] = useState(!!quoteId)

  // Datos del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [projectAddress, setProjectAddress] = useState('')

  // Datos del proyecto
  const [propertyType, setPropertyType] = useState<PropertyType>('residential')
  const [sqft, setSqft] = useState('')
  const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>('final')
  const [hasDebris, setHasDebris] = useState(false)
  const [hasStickers, setHasStickers] = useState(false)

  // Montos
  const [totalAmount, setTotalAmount] = useState('')
  const [isDeposit, setIsDeposit] = useState(false)
  const dueDateDefault = new Date()
  dueDateDefault.setDate(dueDateDefault.getDate() + 15)
  const [dueDate, setDueDate] = useState(formatDateForInput(dueDateDefault))
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)

  // Cargar datos de la quote si viene con ?quoteId=xxx
  useEffect(() => {
    if (!quoteId) return
    async function loadQuote() {
      try {
        const res = await fetch(`/api/quotes/${quoteId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        const q = data.quote
        setCustomerName(q.customerName || '')
        setCustomerEmail(q.customerEmail || '')
        setCustomerPhone(q.customerPhone || '')
        setProjectAddress(q.projectAddress || '')
        setPropertyType(q.propertyType)
        setSqft(String(q.sqft))
        setCleaningLevel(q.cleaningLevel)
        setHasDebris(q.hasDebris)
        setHasStickers(q.hasStickers)
        // Usar finalPrice si existe, sino el maxPrice
        const price = q.finalPrice || q.maxPrice
        setTotalAmount(String(price))
        toast({
          title: 'Quote data loaded',
          description: `From quote #${q.id.slice(-8).toUpperCase()} - $${price}`,
        })
      } catch (e) {
        toast({
          title: 'Could not load quote',
          description: 'You can still create the invoice manually.',
          variant: 'destructive',
        })
      } finally {
        setLoadingQuote(false)
      }
    }
    loadQuote()
  }, [quoteId, toast])

  function validate(): string | null {
    if (!customerName.trim()) return 'Please enter the customer name.'
    if (!customerEmail.trim()) return 'Please enter the customer email.'
    if (!customerPhone.trim()) return 'Please enter the customer phone.'
    if (!projectAddress.trim()) return 'Please enter the project address.'
    const amt = parseFloat(totalAmount)
    if (!amt || amt <= 0) return 'Please enter a valid total amount.'
    if (!sqft || parseInt(sqft) <= 0) return 'Please enter a valid square footage.'
    return null
  }

  async function handleSave() {
    const error = validate()
    if (error) {
      toast({ title: 'Missing information', description: error, variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quoteId || undefined,
          customerName,
          customerEmail,
          customerPhone,
          projectAddress,
          propertyType,
          cleaningLevel,
          sqft: parseInt(sqft),
          hasDebris,
          hasStickers,
          totalAmount: parseFloat(totalAmount),
          isDeposit,
          dueDate: new Date(dueDate).toISOString(),
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Invoice created', description: `Number: ${data.invoice.number}` })
      router.push(`/admin/invoices/${data.invoice.id}`)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to create invoice',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const amountDue = isDeposit ? parseFloat(totalAmount || '0') * 0.5 : parseFloat(totalAmount || '0')

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoices
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">New Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Create a manual invoice for walk-in clients. Number will be auto-assigned.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="John Smith" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="(305) 555-0100" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email <span className="text-destructive">*</span>
                  </Label>
                  <Input type="email" placeholder="john@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Project Address <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="123 Main St, Miami, FL" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" /> Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Property Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPropertyType('residential')}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      propertyType === 'residential' ? 'border-primary bg-secondary text-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">Residential</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType('commercial')}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      propertyType === 'commercial' ? 'border-primary bg-secondary text-primary' : 'border-border hover:border-primary/50'
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
                  <Input id="sqft" type="number" min="1" placeholder="e.g. 2500" value={sqft} onChange={(e) => setSqft(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cleaning Level</Label>
                  <RadioGroup
                    value={cleaningLevel}
                    onValueChange={(v) => setCleaningLevel(v as CleaningLevel)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {['rough', 'final', 'both'].map((lvl) => (
                      <label
                        key={lvl}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 text-sm transition-all capitalize ${
                          cleaningLevel === lvl ? 'border-primary bg-secondary' : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value={lvl} id={`i-${lvl}`} />
                        {lvl === 'both' ? 'Both' : lvl}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${hasDebris ? 'border-primary bg-secondary' : 'border-border'}`}>
                  <Checkbox checked={hasDebris} onCheckedChange={(v) => setHasDebris(v === true)} />
                  <span className="text-sm font-medium">Debris Removal</span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${hasStickers ? 'border-primary bg-secondary' : 'border-border'}`}>
                  <Checkbox checked={hasStickers} onCheckedChange={(v) => setHasStickers(v === true)} />
                  <span className="text-sm font-medium">Window Stickers</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" /> Amount & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount ($) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="amount" type="number" step="0.01" placeholder="e.g. 1500.00" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${isDeposit ? 'border-amber-400 bg-amber-50' : 'border-border'}`}>
                <Checkbox checked={isDeposit} onCheckedChange={(v) => setIsDeposit(v === true)} className="mt-0.5" />
                <div className="flex-1">
                  <span className="block text-sm font-medium">
                    This is a 50% deposit invoice
                  </span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    Check this if the client is paying only the deposit now. The PDF and email will show the remaining balance due upon completion.
                  </span>
                  {isDeposit && totalAmount && (
                    <div className="mt-3 rounded-lg border border-amber-300 bg-white p-3 text-sm">
                      <p className="text-muted-foreground">Deposit due now (50%): <strong className="text-amber-700">${amountDue.toFixed(2)}</strong></p>
                      <p className="text-muted-foreground mt-1">Balance due upon completion: <strong className="text-navy">${(parseFloat(totalAmount) - amountDue).toFixed(2)}</strong></p>
                    </div>
                  )}
                </div>
              </label>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" rows={3} placeholder="Any additional notes about this invoice..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <Card className="sticky top-20 border-primary/30 bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              <CardDescription>Review and save to create the invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-1.5 text-xs">
                {customerName && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="font-medium">{customerName}</dd>
                  </div>
                )}
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
                {totalAmount && (
                  <>
                    <div className="flex justify-between border-t border-border/60 pt-1.5">
                      <dt className="text-muted-foreground">Total</dt>
                      <dd className="font-medium tabular-nums">${parseFloat(totalAmount).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{isDeposit ? 'Deposit 50%' : 'Full'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-bold text-primary">Amount Due</dt>
                      <dd className="font-bold tabular-nums text-primary">${amountDue.toFixed(2)}</dd>
                    </div>
                  </>
                )}
              </dl>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-platinum-primary text-platinum-bright hover:opacity-90" size="lg">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Invoice
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Number auto-assigned (INV-YYYY-NNN)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Wrapper con Suspense (requerido por Next.js 16 para useSearchParams)
export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewInvoiceContent />
    </Suspense>
  )
}
