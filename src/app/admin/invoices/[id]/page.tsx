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
import { Checkbox } from '@/components/ui/checkbox'
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
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Pencil,
  DollarSign,
  Receipt,
  Trash2,
} from 'lucide-react'

interface Invoice {
  id: string
  number: string
  status: string
  isDeposit: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  projectAddress: string
  propertyType: string
  cleaningLevel: string
  sqft: number
  hasDebris: boolean
  hasStickers: boolean
  totalAmount: number
  amountDue: number
  issueDate: string
  dueDate: string
  sentAt: string | null
  paidAt: string | null
  notes: string | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatLevel(level: string) {
  if (level === 'both') return 'Rough + Final Clean'
  return `${level.charAt(0).toUpperCase() + level.slice(1)} Clean`
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; color: string }> = {
  draft: { label: 'Draft', variant: 'secondary', color: 'text-muted-foreground' },
  sent: { label: 'Sent', variant: 'default', color: 'text-blue-600' },
  paid: { label: 'Paid', variant: 'default', color: 'text-emerald-600' },
  overdue: { label: 'Overdue', variant: 'destructive', color: 'text-destructive' },
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit form
  const [editTotalAmount, setEditTotalAmount] = useState('')
  const [editIsDeposit, setEditIsDeposit] = useState(false)
  const [editDueDate, setEditDueDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editCustomerEmail, setEditCustomerEmail] = useState('')
  const [editCustomerPhone, setEditCustomerPhone] = useState('')
  const [editProjectAddress, setEditProjectAddress] = useState('')

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${params.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setInvoice(data.invoice)
        setEditTotalAmount(String(data.invoice.totalAmount))
        setEditIsDeposit(data.invoice.isDeposit)
        setEditDueDate(data.invoice.dueDate.split('T')[0])
        setEditNotes(data.invoice.notes || '')
        setEditCustomerName(data.invoice.customerName)
        setEditCustomerEmail(data.invoice.customerEmail)
        setEditCustomerPhone(data.invoice.customerPhone)
        setEditProjectAddress(data.invoice.projectAddress)
        setEmailTo(data.invoice.customerEmail)
      } catch {
        toast({ title: 'Error', description: 'Failed to load invoice.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [params.id, toast])

  async function handleStatusChange(status: string) {
    if (!invoice) return
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setInvoice(data.invoice)
      toast({ title: 'Status updated', description: `Marked as ${status}.` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
    }
  }

  async function handleDownloadPDF() {
    if (!invoice) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/invoices/pdf/${invoice.id}`)
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.pdf`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: 'PDF downloaded' })
    } catch {
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  async function handleSendEmail() {
    if (!invoice) return
    if (!emailTo) {
      toast({ title: 'Missing email', description: 'Please enter a recipient email.', variant: 'destructive' })
      return
    }
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Invoice sent', description: `Email sent to ${emailTo}` })
      setEmailOpen(false)
      // Refresh invoice data (status may have changed to 'sent')
      const refreshRes = await fetch(`/api/invoices/${invoice.id}`)
      const refreshData = await refreshRes.json()
      if (refreshRes.ok) setInvoice(refreshData.invoice)
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

  async function handleSaveEdit() {
    if (!invoice) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        customerName: editCustomerName,
        customerEmail: editCustomerEmail,
        customerPhone: editCustomerPhone,
        projectAddress: editProjectAddress,
        totalAmount: parseFloat(editTotalAmount),
        isDeposit: editIsDeposit,
        dueDate: new Date(editDueDate).toISOString(),
        notes: editNotes,
      }
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setInvoice(data.invoice)
      setEditOpen(false)
      toast({ title: 'Invoice updated' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update invoice.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!invoice) return
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Invoice deleted' })
      router.push('/admin/invoices')
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/invoices">Back to Invoices</Link>
        </Button>
      </div>
    )
  }

  const sc = statusConfig[invoice.status] || statusConfig.draft
  const remainingBalance = invoice.totalAmount - invoice.amountDue

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/invoices">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoices
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{invoice.number}</h1>
            <Badge variant={sc.variant}>
              <span className={sc.color}>●</span> {sc.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Issued {formatDate(invoice.issueDate)}
            {invoice.sentAt && ` · Sent ${formatDate(invoice.sentAt)}`}
            {invoice.paidAt && ` · Paid ${formatDate(invoice.paidAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setEditOpen(true)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-platinum-primary text-platinum-bright hover:opacity-90"
          >
            {downloading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Download PDF</>
            )}
          </Button>
          <Button onClick={() => setEmailOpen(true)} variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Send Email
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Amount box */}
          <Card className="border-primary/30 bg-secondary/30">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  {invoice.isDeposit ? 'DEPOSIT DUE (50%)' : 'AMOUNT DUE'}
                </p>
                <p className={`text-4xl font-bold ${invoice.status === 'paid' ? 'text-emerald-600' : 'text-primary'}`}>
                  {formatCurrency(invoice.amountDue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.isDeposit
                    ? `Remaining balance of ${formatCurrency(remainingBalance)} due upon completion`
                    : `Total: ${formatCurrency(invoice.totalAmount)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service description */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Service Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Property Type</dt>
                  <dd className="mt-1 font-medium capitalize">{invoice.propertyType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Cleaning Level</dt>
                  <dd className="mt-1 font-medium">{formatLevel(invoice.cleaningLevel)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Square Footage</dt>
                  <dd className="mt-1 font-medium tabular-nums">{invoice.sqft.toLocaleString()} SQFT</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Additional Services</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {invoice.hasDebris && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Debris</Badge>
                    )}
                    {invoice.hasStickers && (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">Stickers</Badge>
                    )}
                    {!invoice.hasDebris && !invoice.hasStickers && (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* Amount breakdown */}
              <div className="mt-6 space-y-2 border-t border-border/60 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Service Amount</span>
                  <span className="font-medium tabular-nums">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.isDeposit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit Due Now (50%)</span>
                    <span className="font-medium tabular-nums">{formatCurrency(invoice.amountDue)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                  <span>{invoice.isDeposit ? 'Balance Due Upon Completion' : 'Amount Due'}</span>
                  <span className="tabular-nums text-primary">
                    {formatCurrency(invoice.isDeposit ? remainingBalance : invoice.amountDue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Bill To
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{invoice.customerName}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{invoice.customerPhone}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="break-all">{invoice.customerEmail}</span></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{invoice.projectAddress}</span></div>
            </CardContent>
          </Card>

          {/* Status control */}
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={invoice.status} onValueChange={handleStatusChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {invoice.status !== 'paid' && (
                <Button
                  onClick={() => handleStatusChange('paid')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
              )}
              {invoice.status === 'paid' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm text-emerald-700">
                  <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
                  Payment received on {invoice.paidAt ? formatDate(invoice.paidAt) : 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardContent className="p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Invoice
            </DialogTitle>
            <DialogDescription>Update customer data, amount, and payment details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editCustomerPhone} onChange={(e) => setEditCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editCustomerEmail} onChange={(e) => setEditCustomerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Project Address</Label>
                <Input value={editProjectAddress} onChange={(e) => setEditProjectAddress(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" step="0.01" value={editTotalAmount} onChange={(e) => setEditTotalAmount(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-lg border-2 border-border p-3">
              <Checkbox checked={editIsDeposit} onCheckedChange={(v) => setEditIsDeposit(v === true)} className="mt-0.5" />
              <div>
                <span className="text-sm font-medium">50% deposit invoice</span>
                <span className="block text-xs text-muted-foreground">Amount due will be 50% of total</span>
              </div>
            </label>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
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

      {/* Email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Send Invoice by Email
            </DialogTitle>
            <DialogDescription>
              The invoice PDF will be attached to a professionally designed email and sent to the recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">Recipient Email</Label>
              <Input id="email-to" type="email" placeholder="customer@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail} className="bg-platinum-primary text-platinum-bright hover:opacity-90">
              {sendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
