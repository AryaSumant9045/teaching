import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const session = req.auth
  const isLoggedIn = !!session
  const userRole = (session?.user as { role?: string })?.role
  const isAdmin = userRole === "admin"

  const { pathname } = req.nextUrl

  // Backward-compatible redirects for old auth URLs.
  if (pathname === '/auth/register') {
    return NextResponse.redirect(new URL('/register', req.nextUrl))
  }
  if (pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAdminPage = pathname.startsWith('/admin')
  const isStudentProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/practice')

  // Redirect logged-in admins away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', req.nextUrl))
  }

  // Redirect non-logged-in users away from protected pages
  if ((isStudentProtected || isAdminPage) && !isLoggedIn) {
    const from = pathname + (req.nextUrl.search || '')
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.nextUrl)
    )
  }

  // Redirect non-admins away from /admin
  if (isAdminPage && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/purchases/user',
  ],
}
