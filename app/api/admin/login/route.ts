import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD no configurado en .env.local')
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
  }

  if (password === adminPassword) {
    const response = NextResponse.json({ mensaje: 'Autenticación exitosa' })
    response.cookies.set('el-oasis-admin', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    })
    return response
  }

  return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
}