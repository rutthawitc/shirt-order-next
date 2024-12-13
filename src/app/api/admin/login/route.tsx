// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/config/env'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!env.adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (password !== env.adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    (await cookies()).set('admin_authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}