// src/app/page.tsx

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ShirtOrderForm from "@/components/ShirtOrderForm";

export default async function Home() {
  // Check order status
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/toggle-status`);
    if (!response.ok) throw new Error('Failed to fetch order status');
    const data = await response.json();
    
    // Redirect to thank you page if orders are closed
    if (data.ordersClosed) {
      redirect("/thank-you");
    }
    
    // Otherwise, show the order form
    return (
      <div className="w-full max-w-4xl mx-auto">
        <ShirtOrderForm />
      </div>
    );
  } catch (error) {
    console.error('Error checking order status:', error);
    return <div>เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>;
  }
}

/**
 * @description: Commented code is the original code
 */
/* export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/thank-you");
  return null;
} */
