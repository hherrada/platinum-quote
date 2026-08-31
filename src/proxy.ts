// Middleware para proteger rutas /admin (excepto /admin/login)
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Permitir acceso a /admin/login sin token
      const { pathname } = req.nextUrl
      if (pathname.startsWith('/admin/login')) {
        return true
      }
      // El resto de /admin requiere token
      return !!token
    },
  },
})

export const config = {
  matcher: ['/admin/:path*'],
}
