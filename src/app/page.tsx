// src/app/page.tsx

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ShirtOrderForm from "@/components/ShirtOrderForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default async function Home() {
  // Check order status
  try {
    // Get base URL from environment or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/orders/toggle-status`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch order status");
    const data = await response.json();

    // Redirect to thank you page if orders are closed
    if (data.ordersClosed) {
      redirect("/thank-you");
    }

    // Otherwise, show the order form
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Suspense
          fallback={
            <Card className="w-full max-w-4xl mx-auto mt-8">
              <CardHeader className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardHeader>
              <CardContent className="text-center">
                <p>กำลังโหลด...</p>
              </CardContent>
            </Card>
          }
        >
          <ShirtOrderForm />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error checking order status:", error);
    return <div>เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>;
  }
}
