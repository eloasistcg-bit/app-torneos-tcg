import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ mensaje: 'Sesión cerrada' })
  response.cookies.delete('el-oasis-admin')
  return response
}