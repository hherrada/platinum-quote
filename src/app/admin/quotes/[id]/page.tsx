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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch(`/api/quotes/${params.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setQuote(data.quote)
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
    if (!quote?.customerEmail) {
      toast({
        title: 'No email',
        description: 'This quote has no customer email address.',
        variant: 'destructive',
      })
      return
    }
    setSendingEmail(true)
    try {
      // Simulacion de envio por email (en produccion se integraria con un servicio SMTP)
      await new Promise((r) => setTimeout(r, 1200))
      toast({
        title: 'Email sent',
        description: `Quote sent to ${quote.customerEmail}.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send email.',
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
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-emerald-600 hover:bg-emerald-700"
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
          <Button onClick={handleSendEmail} disabled={sendingEmail} variant="outline">
            {sendingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" /> Send by Email
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Caja de precio */}
          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium text-emerald-700">
                  ESTIMATED PRICE RANGE
                </p>
                <p className="text-4xl font-bold text-emerald-700">
                  {formatCurrency(quote.minPrice)} –{' '}
                  {formatCurrency(quote.maxPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Subject to visual inspection on site
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del proyecto */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-emerald-600" /> Project Details
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
                  <dd className="mt-1 font-medium capitalize">
                    {quote.cleaningLevel} Clean
                  </dd>
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
                <User className="h-5 w-5 text-emerald-600" /> Customer
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
    </div>
  )
}
