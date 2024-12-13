// src/components/ShirtDesignCard.tsx
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import type { ShirtDesign } from '@/types/order'

interface ShirtDesignCardProps {
  design: ShirtDesign;
}

export default function ShirtDesignCard({ design }: ShirtDesignCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 gap-2 p-2">
        {design.images.map((img, idx) => (
          <div key={idx} className="relative aspect-[4/3] w-full">
            <Image
              src={img}
              alt={`${design.name} - มุมที่ ${idx + 1}`}
              fill
              className="object-cover rounded"
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              loading={idx === 0 ? "eager" : "lazy"}
              priority={idx === 0 && design.id === '1'}
              unoptimized={process.env.NODE_ENV === 'development'}
            />
          </div>
        ))}
      </div>
      <div className="p-4">
        <h4 className="font-semibold">{design.name}</h4>
        <p className="text-sm text-gray-600 mb-2">
          {design.description}
        </p>
        <p className="font-semibold text-lg">
          {design.price.toLocaleString()} บาท
        </p>
      </div>
    </Card>
  )
}