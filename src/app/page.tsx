// src/app/page.tsx
export const dynamic = "force-dynamic";
import ShirtOrderForm from "@/components/ShirtOrderForm"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <ShirtOrderForm />
      </Suspense>
    </div>
  )
}