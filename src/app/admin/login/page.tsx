'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/public/logo'
import { Loader2, LogIn, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'

// Wrapper con Suspense (requerido por Next.js 16 para useSearchParams)
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-platinum-radial">
        <Loader2 className="h-8 w-8 animate-spin text-platinum-bright" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-platinum-radial px-4 py-12">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-platinum hover:text-platinum-bright"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="drop-shadow-xl" height={64} />
          <h1 className="mt-6 text-2xl font-bold text-platinum-bright">Admin Portal</h1>
          <p className="text-sm text-platinum">
            Sign in to access the management dashboard
          </p>
          {/* Contacto directo */}
          <a
            href="tel:+17865127353"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-platinum/30 bg-white/5 px-3 py-1.5 text-xs text-platinum-bright transition-colors hover:bg-white/10"
          >
            <Phone className="h-3.5 w-3.5" />
            Maria Roldan · (786) 512-7353
          </a>
        </div>

        <Card className="border-platinum/20 bg-white shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <LogIn className="h-5 w-5 text-primary" /> Staff Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@platinumcleaning.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-platinum-primary text-platinum-bright hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-primary">Demo credentials:</p>
              <p>Email: admin@platinumcleaning.com</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
