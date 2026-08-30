'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Settings2,
  Save,
  Loader2,
  Home,
  Building2,
  Wrench,
  Sticker,
  AlertCircle,
} from 'lucide-react'

interface PricingRow {
  id: string
  propertyType: string
  cleaningLevel: string
  minRatePerSqft: number
  maxRatePerSqft: number
}

interface ServiceRow {
  id: string
  key: string
  label: string
  minPrice: number
  maxPrice: number
}

export default function PricingMatrixPage() {
  const { toast } = useToast()
  const [matrix, setMatrix] = useState<PricingRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // id que se esta guardando

  // Copias editables
  const [matrixDraft, setMatrixDraft] = useState<Record<string, { min: string; max: string }>>({})
  const [serviceDraft, setServiceDraft] = useState<Record<string, { min: string; max: string }>>({})

  const fetchPricing = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pricing')
      const data = await res.json()
      setMatrix(data.matrix || [])
      setServices(data.services || [])
      // Inicializar drafts
      const mDraft: Record<string, { min: string; max: string }> = {}
      data.matrix.forEach((m: PricingRow) => {
        mDraft[m.id] = {
          min: m.minRatePerSqft.toFixed(2),
          max: m.maxRatePerSqft.toFixed(2),
        }
      })
      setMatrixDraft(mDraft)

      const sDraft: Record<string, { min: string; max: string }> = {}
      data.services.forEach((s: ServiceRow) => {
        sDraft[s.id] = {
          min: s.minPrice.toFixed(2),
          max: s.maxPrice.toFixed(2),
        }
      })
      setServiceDraft(sDraft)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load pricing.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPricing()
  }, [fetchPricing])

  async function saveMatrix(id: string) {
    const draft = matrixDraft[id]
    if (!draft) return
    const min = parseFloat(draft.min)
    const max = parseFloat(draft.max)
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      toast({
        title: 'Invalid input',
        description: 'Please enter valid positive numbers.',
        variant: 'destructive',
      })
      return
    }
    if (min > max) {
      toast({
        title: 'Invalid range',
        description: 'Min rate cannot exceed max rate.',
        variant: 'destructive',
      })
      return
    }
    setSaving(id)
    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'matrix', id, minRatePerSqft: min, maxRatePerSqft: max }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast({ title: 'Pricing updated', description: 'The rate has been saved.' })
      fetchPricing()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update',
        variant: 'destructive',
      })
    } finally {
      setSaving(null)
    }
  }

  async function saveService(id: string) {
    const draft = serviceDraft[id]
    if (!draft) return
    const min = parseFloat(draft.min)
    const max = parseFloat(draft.max)
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      toast({
        title: 'Invalid input',
        description: 'Please enter valid positive numbers.',
        variant: 'destructive',
      })
      return
    }
    if (min > max) {
      toast({
        title: 'Invalid range',
        description: 'Min price cannot exceed max price.',
        variant: 'destructive',
      })
      return
    }
    setSaving(id)
    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'service', id, minPrice: min, maxPrice: max }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast({ title: 'Service updated', description: 'The price has been saved.' })
      fetchPricing()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update',
        variant: 'destructive',
      })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Matrix</h1>
        <p className="text-sm text-muted-foreground">
          Manage the price rates per square foot and additional service charges.
          Changes apply to all new quotes immediately.
        </p>
      </div>

      {/* Tarifas por SQFT */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-emerald-600" /> Rate per SQFT
          </CardTitle>
          <CardDescription>
            Minimum and maximum rates per square foot, by property type and
            cleaning level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrix.map((row) => (
              <div
                key={row.id}
                className="grid items-end gap-3 rounded-lg border border-border/60 p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">Combination</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {row.propertyType === 'residential' ? (
                      <Home className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="font-medium capitalize">
                      {row.propertyType}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {row.cleaningLevel} clean
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`min-${row.id}`} className="text-xs">
                    Min Rate ($/sqft)
                  </Label>
                  <Input
                    id={`min-${row.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={matrixDraft[row.id]?.min ?? ''}
                    onChange={(e) =>
                      setMatrixDraft((prev) => ({
                        ...prev,
                        [row.id]: {
                          min: e.target.value,
                          max: prev[row.id]?.max ?? '',
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${row.id}`} className="text-xs">
                    Max Rate ($/sqft)
                  </Label>
                  <Input
                    id={`max-${row.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={matrixDraft[row.id]?.max ?? ''}
                    onChange={(e) =>
                      setMatrixDraft((prev) => ({
                        ...prev,
                        [row.id]: {
                          min: prev[row.id]?.min ?? '',
                          max: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={() => saveMatrix(row.id)}
                  disabled={saving === row.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" /> Save
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Servicios adicionales */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-emerald-600" /> Additional Services
          </CardTitle>
          <CardDescription>
            Fixed price ranges for optional add-on services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="grid items-end gap-3 rounded-lg border border-border/60 p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">Service</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {service.key === 'debris' ? (
                      <Wrench className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Sticker className="h-4 w-4 text-sky-600" />
                    )}
                    <span className="font-medium">{service.label}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`smin-${service.id}`} className="text-xs">
                    Min Price ($)
                  </Label>
                  <Input
                    id={`smin-${service.id}`}
                    type="number"
                    step="1"
                    min="0"
                    value={serviceDraft[service.id]?.min ?? ''}
                    onChange={(e) =>
                      setServiceDraft((prev) => ({
                        ...prev,
                        [service.id]: {
                          min: e.target.value,
                          max: prev[service.id]?.max ?? '',
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`smax-${service.id}`} className="text-xs">
                    Max Price ($)
                  </Label>
                  <Input
                    id={`smax-${service.id}`}
                    type="number"
                    step="1"
                    min="0"
                    value={serviceDraft[service.id]?.max ?? ''}
                    onChange={(e) =>
                      setServiceDraft((prev) => ({
                        ...prev,
                        [service.id]: {
                          min: prev[service.id]?.min ?? '',
                          max: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={() => saveService(service.id)}
                  disabled={saving === service.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" /> Save
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nota informativa */}
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="text-sm">
          <p className="font-medium text-emerald-900">How pricing works</p>
          <p className="mt-1 text-emerald-800">
            The estimated range for each quote is calculated as:{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              SQFT × rate (min/max)
            </code>{' '}
            plus any selected additional services. Final pricing is always
            confirmed after an on-site visual inspection.
          </p>
        </div>
      </div>
    </div>
  )
}
