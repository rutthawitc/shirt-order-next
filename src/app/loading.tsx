// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
    </div>
  )
}