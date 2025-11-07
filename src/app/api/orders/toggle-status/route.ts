// src/app/api/orders/toggle-status/route.ts
import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

// In-memory store fallback when Redis is unavailable
let inMemoryOrdersClosed = false;

export async function GET() {
  try {
    let ordersClosed: boolean;

    if (redis) {
      // Use Redis if available
      try {
        ordersClosed = await redis.get('ordersClosed') === 'true';
      } catch (redisError) {
        console.error("[Redis] Error getting order status, falling back to in-memory:", redisError);
        ordersClosed = inMemoryOrdersClosed;
      }
    } else {
      // Use in-memory store when Redis is unavailable
      ordersClosed = inMemoryOrdersClosed;
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

    if (redis) {
      // Use Redis if available
      try {
        const currentStatus = await redis.get('ordersClosed') === 'true';
        ordersClosed = !currentStatus;
        await redis.set('ordersClosed', String(ordersClosed));
      } catch (redisError) {
        console.error("[Redis] Error toggling order status, falling back to in-memory:", redisError);
        inMemoryOrdersClosed = !inMemoryOrdersClosed;
        ordersClosed = inMemoryOrdersClosed;
      }
    } else {
      // Use in-memory store when Redis is unavailable
      inMemoryOrdersClosed = !inMemoryOrdersClosed;
      ordersClosed = inMemoryOrdersClosed;
    }

    return NextResponse.json({ success: true, ordersClosed });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
