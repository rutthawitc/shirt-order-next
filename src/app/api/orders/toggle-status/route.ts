// src/app/api/orders/toggle-status/route.ts
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// In-memory store for development
let devOrdersClosed = false;

export async function GET() {
  try {
    let ordersClosed: boolean;

    if (process.env.NODE_ENV === "development") {
      // Use in-memory store in development
      ordersClosed = devOrdersClosed;
    } else {
      // Use Vercel KV in production
      try {
        ordersClosed = (await kv.get<boolean>("ordersClosed")) || false;
      } catch (error) {
        console.error("Error accessing Vercel KV:", error);
        ordersClosed = false;
      }
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
      // Use Vercel KV in production
      try {
        const currentStatus = (await kv.get<boolean>("ordersClosed")) || false;
        ordersClosed = !currentStatus;
        await kv.set("ordersClosed", ordersClosed);
      } catch (error) {
        console.error("Error accessing Vercel KV:", error);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, ordersClosed });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
