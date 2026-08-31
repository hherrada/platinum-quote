'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Download,
  Mail,
  Loader2,
  Home,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
  Trash2,
  Pencil,
  Copy,
  DollarSign,
} from 'lucide-react'

interface Quote {
  id: string
  source: string
  status: string
  propertyType: string
  sqft: number
  cleaningLevel: string
  hasDebris: boolean
  hasStickers: boolean
  minPrice: number
  maxPrice: number
  finalPrice: number | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  projectAddress: string | null
  notes: string | null
  createdAt: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
}

function formatLevel(level: string) {
  if (level === 'both') return 'Rough + Final Clean'
  return `${level.charAt(0).toUpperCase() + level.slice(1)} Clean`
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  // Edit form state
  const [editFinalPrice, setEditFinalPrice] = useState('')
  const [editStatus, setEditStatus] = useState('pending')
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editCustomerEmail, setEditCustomerEmail] = useState('')
  const [editCustomerPhone, setEditCustomerPhone] = useState('')
  const [editProjectAddress, setEditProjectAddress] = useState('')
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch(`/api/quotes/${params.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setQuote(data.quote)
        // Initialize edit form
        setEditStatus(data.quote.status)
        setEditFinalPrice(data.quote.finalPrice ? String(data.quote.finalPrice) : '')
        setEditCustomerName(data.quote.customerName || '')
        setEditCustomerEmail(data.quote.customerEmail || '')
        setEditCustomerPhone(data.quote.customerPhone || '')
        setEditProjectAddress(data.quote.projectAddress || '')
        setEditNotes(data.quote.notes || '')
        setEmailTo(data.quote.customerEmail || '')
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load quote.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchQuote()
  }, [params.id, toast])

  async function updateStatus(status: string) {
    if (!quote) return
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setQuote(data.quote)
      toast({ title: 'Status updated', description: `Marked as ${status}.` })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      })
    }
  }

  async function handleSaveEdit() {
    if (!quote) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        status: editStatus,
        customerName: editCustomerName,
        customerEmail: editCustomerEmail,
        customerPhone: editCustomerPhone,
        projectAddress: editProjectAddress,
        notes: editNotes,
      }
      if (editFinalPrice) {
        body.finalPrice = parseFloat(editFinalPrice)
      } else {
        body.finalPrice = null
      }
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setQuote(data.quote)
      setEditOpen(false)
      toast({ title: 'Quote updated', description: 'Changes saved successfully.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update quote.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicate() {
    if (!quote) return
    setDuplicating(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      toast({
        title: 'Quote duplicated',
        description: 'Redirecting to the new quote...',
      })
      router.push(`/admin/quotes/${data.quote.id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to duplicate quote.',
        variant: 'destructive',
      })
    } finally {
      setDuplicating(false)
    }
  }

  async function handleDownloadPDF() {
    if (!quote) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/pdf/${quote.id}`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `quote-${quote.id.slice(-8).toUpperCase()}.pdf`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: 'PDF downloaded', description: 'The quote PDF has been downloaded.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  async function handleSendEmail() {
    if (!quote) return
    if (!emailTo) {
      toast({
        title: 'Missing email',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      })
      return
    }
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Email sent',
        description: `Quote sent to ${emailTo}.`,
      })
      setEmailOpen(false)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to send email.',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  async function handleDelete() {
    if (!quote) return
    if (!confirm('Are you sure you want to delete this quote? This cannot be undone.')) {
      return
    }
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Quote deleted' })
      router.push('/admin')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete quote.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Quote not found.</p>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const sc = statusConfig[quote.status] || statusConfig.pending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Quote #{quote.id.slice(-8).toUpperCase()}
            </h1>
            <Badge variant={sc.variant}>
              <sc.icon className="mr-1 h-3 w-3" /> {sc.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDate(quote.createdAt)} · Source:{' '}
            <span className="font-medium capitalize">{quote.source}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setEditOpen(true)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button onClick={handleDuplicate} disabled={duplicating} variant="outline">
            {duplicating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}{' '}
            Duplicate
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-platinum-primary text-platinum-bright hover:opacity-90"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
          <Button onClick={() => setEmailOpen(true)} variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Send by Email
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Caja de precio */}
          <Card className="border-primary/30 bg-secondary/30">
            <CardContent className="p-6">
              {quote.finalPrice ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-emerald-700">
                    FINAL PRICE (APPROVED)
                  </p>
                  <p className="text-4xl font-bold text-emerald-700">
                    {formatCurrency(quote.finalPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estimated range was: {formatCurrency(quote.minPrice)} –{' '}
                    {formatCurrency(quote.maxPrice)}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-primary">
                    ESTIMATED PRICE RANGE
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(quote.minPrice)} –{' '}
                    {formatCurrency(quote.maxPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Subject to visual inspection on site
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles del proyecto */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" /> Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Property Type</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-medium capitalize">
                    {quote.propertyType === 'residential' ? (
                      <Home className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    {quote.propertyType}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Cleaning Level</dt>
                  <dd className="mt-1 font-medium">{formatLevel(quote.cleaningLevel)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Square Footage</dt>
                  <dd className="mt-1 font-medium tabular-nums">
                    {quote.sqft.toLocaleString()} SQFT
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Additional Services</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {quote.hasDebris && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                        Debris Removal
                      </Badge>
                    )}
                    {quote.hasStickers && (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                        Window Stickers
                      </Badge>
                    )}
                    {!quote.hasDebris && !quote.hasStickers && (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Notas */}
          {quote.notes && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Legal Disclaimer:</strong> This is a referential estimate
              subject to visual inspection on site. Final pricing may vary based
              on actual site conditions. No price is final without an on-site
              inspection.
            </AlertDescription>
          </Alert>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{quote.customerName || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{quote.customerPhone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">
                  {quote.customerEmail || 'Not provided'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{quote.projectAddress || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(quote.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar estado */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={quote.status} onValueChange={updateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-emerald-600"
                  onClick={() => updateStatus('approved')}
                  disabled={quote.status === 'approved'}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive"
                  onClick={() => updateStatus('rejected')}
                  disabled={quote.status === 'rejected'}
                >
                  <XCircle className="mr-1 h-4 w-4" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acciones peligrosas */}
          <Card className="border-destructive/30">
            <CardContent className="p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de edicion */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Quote
            </DialogTitle>
            <DialogDescription>
              Update customer data, status, and set the final price after inspection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-final">Final Price ($) — leave empty to keep estimate range</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="edit-final"
                  type="number"
                  placeholder="e.g. 850"
                  value={editFinalPrice}
                  onChange={(e) => setEditFinalPrice(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set this after the on-site inspection to lock the final price.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Customer Name</Label>
                <Input id="edit-name" value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={editCustomerPhone} onChange={(e) => setEditCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editCustomerEmail} onChange={(e) => setEditCustomerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-addr">Project Address</Label>
                <Input id="edit-addr" value={editProjectAddress} onChange={(e) => setEditProjectAddress(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-platinum-primary text-platinum-bright hover:opacity-90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de email */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Send Quote by Email
            </DialogTitle>
            <DialogDescription>
              The quote PDF will be attached to a professionally designed email and sent to the recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">Recipient Email</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="customer@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail} className="bg-platinum-primary text-platinum-bright hover:opacity-90">
              {sendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
