'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  FilePlus2,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  DollarSign,
  Receipt,
} from 'lucide-react'

interface Invoice {
  id: string
  number: string
  status: string
  isDeposit: boolean
  customerName: string
  customerEmail: string
  totalAmount: number
  amountDue: number
  issueDate: string
  dueDate: string
  paidAt: string | null
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
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Clock; color: string }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Clock, color: 'text-muted-foreground' },
  sent: { label: 'Sent', variant: 'default', icon: Send, color: 'text-blue-600' },
  paid: { label: 'Paid', variant: 'default', icon: CheckCircle2, color: 'text-emerald-600' },
  overdue: { label: 'Overdue', variant: 'destructive', icon: AlertCircle, color: 'text-destructive' },
}

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/invoices?${params.toString()}`)
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load invoices.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, toast])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  async function markPaid(id: string) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Invoice marked as paid' })
      fetchInvoices()
    } catch {
      toast({ title: 'Error', description: 'Failed to update invoice.', variant: 'destructive' })
    }
  }

  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    totalPaid: invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amountDue, 0),
    totalOutstanding: invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amountDue, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices and track payments.
          </p>
        </div>
        <Button asChild className="bg-platinum-primary text-platinum-bright hover:opacity-90">
          <Link href="/admin/invoices/new">
            <FilePlus2 className="mr-2 h-4 w-4" /> New Invoice
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.draft} draft · {stats.sent} sent · {stats.paid} paid
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
            {stats.overdue > 0 && (
              <p className="mt-1 text-xs text-destructive">{stats.overdue} overdue</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Collected</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(stats.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Avg. Invoice</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(stats.total > 0 ? invoices.reduce((s, i) => s + i.totalAmount, 0) / stats.total : 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" /> All Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by number, name, email, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Receipt className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No invoices found.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/admin/invoices/new">Create your first invoice</Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Number</TableHead>
                    <TableHead className="min-w-[180px]">Customer</TableHead>
                    <TableHead className="min-w-[100px]">Amount Due</TableHead>
                    <TableHead className="min-w-[100px]">Total</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[100px]">Due Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const sc = statusConfig[inv.status] || statusConfig.draft
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {inv.number}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{inv.customerName}</div>
                          <div className="text-xs text-muted-foreground">{inv.customerEmail}</div>
                        </TableCell>
                        <TableCell className="font-bold tabular-nums">
                          {formatCurrency(inv.amountDue)}
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {formatCurrency(inv.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {inv.isDeposit ? (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                              Deposit 50%
                            </Badge>
                          ) : (
                            <Badge variant="outline">Full</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(inv.dueDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant}>
                            <sc.icon className={`mr-1 h-3 w-3 ${sc.color}`} />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/invoices/${inv.id}`}>View</Link>
                            </Button>
                            {inv.status !== 'paid' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={() => markPaid(inv.id)}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
