// src/app/api/orders/toggle-status/route.ts
import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

// In-memory store for development
let devOrdersClosed = false;

export async function GET() {
  try {
    let ordersClosed: boolean;

    if (process.env.NODE_ENV === "development") {
      // Use in-memory store in development
      ordersClosed = devOrdersClosed;
    } else {
      // Use Redis in production
      ordersClosed = await redis.get('ordersClosed') === 'true';
    }

    return NextResponse.json({ ordersClosed });
  } catch (error) {
    console.error("Error getting order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    let ordersClosed: boolean;

    if (process.env.NODE_ENV === "development") {
      // Toggle and use in-memory store in development
      devOrdersClosed = !devOrdersClosed;
      ordersClosed = devOrdersClosed;
    } else {
      // Use Redis in production
      const currentStatus = await redis.get('ordersClosed') === 'true';
      ordersClosed = !currentStatus;
      await redis.set('ordersClosed', String(ordersClosed));
    }

    return NextResponse.json({ success: true, ordersClosed });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
