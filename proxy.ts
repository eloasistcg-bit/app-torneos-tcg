import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const adminCookie = request.cookies.get('el-oasis-admin')?.value
  const isAdminLogin = request.nextUrl.pathname === '/admin/login'

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!adminCookie && !isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (adminCookie && isAdminLogin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

