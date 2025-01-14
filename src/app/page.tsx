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

    if (!response.ok) {
      console.error("API Error:", await response.text());
      return (
        <div className="w-full max-w-4xl mx-auto mt-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-red-600">
                เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const data = await response.json();

    // Redirect to thank you page if orders are closed
    if (data.ordersClosed) {
      // Use temporary redirect (307) to allow for order status changes
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
  } catch (error: any) {
    // Don't log redirect "errors" as they're expected behavior
    if (!error.digest?.includes("NEXT_REDIRECT")) {
      console.error("Error checking order status:", error);
    }
    
    // Re-throw redirect errors
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // Show error UI for other errors
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
