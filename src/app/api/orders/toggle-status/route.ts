// src/app/api/orders/toggle-status/route.ts
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST() {
  try {
    const currentStatus = await kv.get<boolean>('ordersClosed') || false
    await kv.set('ordersClosed', !currentStatus)
    
    return NextResponse.json({ success: true, ordersClosed: !currentStatus })
  } catch (error) {
    console.error('Error toggling order status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle order status' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const ordersClosed = await kv.get<boolean>('ordersClosed') || false
    return NextResponse.json({ ordersClosed })
  } catch (error) {
    console.error('Error getting order status:', error)
    return NextResponse.json(
      { error: 'Failed to get order status' },
      { status: 500 }
    )
  }
}
