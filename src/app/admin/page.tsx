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
  XCircle,
  Home,
  Building2,
  Globe,
  FileEdit,
  TrendingUp,
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
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  projectAddress: string | null
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

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/quotes?${params.toString()}`)
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load quotes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, sourceFilter, search, toast])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast({ title: 'Status updated', description: `Quote marked as ${status}.` })
      fetchQuotes()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      })
    }
  }

  // Stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === 'pending').length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
    web: quotes.filter((q) => q.source === 'web').length,
    manual: quotes.filter((q) => q.source === 'manual').length,
    avgValue:
      quotes.length > 0
        ? quotes.reduce((sum, q) => sum + (q.minPrice + q.maxPrice) / 2, 0) /
          quotes.length
        : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage all quotes from the web and manual entries.
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/admin/quotes/new">
            <FilePlus2 className="mr-2 h-4 w-4" /> New Manual Quote
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Quotes</p>
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.web} web · {stats.manual} manual
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending</p>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Approved</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Avg. Value</p>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.avgValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Tabla */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, address..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <FileEdit className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No quotes found.</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters or create a new quote.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="min-w-[180px]">Customer</TableHead>
                    <TableHead className="min-w-[140px]">Property</TableHead>
                    <TableHead className="min-w-[100px]">SQFT</TableHead>
                    <TableHead className="min-w-[100px]">Level</TableHead>
                    <TableHead className="min-w-[150px]">Price Range</TableHead>
                    <TableHead className="min-w-[100px]">Source</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Date</TableHead>
                    <TableHead className="min-w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => {
                    const sc = statusConfig[q.status] || statusConfig.pending
                    return (
                      <TableRow key={q.id}>
                        <TableCell>
                          <div className="font-medium">
                            {q.customerName || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {q.customerEmail || 'No email'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {q.propertyType === 'residential' ? (
                              <Home className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm capitalize">
                              {q.propertyType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {q.sqft.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{q.cleaningLevel}</TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {formatCurrency(q.minPrice)} –{' '}
                          {formatCurrency(q.maxPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              q.source === 'web'
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-violet-200 bg-violet-50 text-violet-700'
                            }
                          >
                            <Globe className="mr-1 h-3 w-3" />
                            {q.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant}>
                            <sc.icon className="mr-1 h-3 w-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(q.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/quotes/${q.id}`}>View</Link>
                            </Button>
                            {q.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  onClick={() => updateStatus(q.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => updateStatus(q.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
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
