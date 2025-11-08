'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  quality?: number
  sizes?: string
  loading?: "lazy" | "eager"
  priority?: boolean
  unoptimized?: boolean
  children?: React.ReactNode
  showZoomIcon?: boolean
}

export default function ImageLightbox({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  quality = 75,
  sizes,
  loading,
  priority,
  unoptimized,
  children,
  showZoomIcon = true,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false)

  const thumbnailImage = fill ? (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      quality={quality}
      sizes={sizes}
      loading={loading}
      priority={priority}
      unoptimized={unoptimized}
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width!}
      height={height!}
      className={className}
      quality={quality}
      sizes={sizes}
      loading={loading}
      priority={priority}
      unoptimized={unoptimized}
    />
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            className="relative group cursor-pointer overflow-hidden rounded"
            aria-label={`คลิกเพื่อดูภาพขยาย: ${alt}`}
          >
            {thumbnailImage}
            {showZoomIcon && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            )}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0">
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1440}
            className="w-auto h-auto max-w-full max-h-[95vh] object-contain"
            quality={90}
            unoptimized={unoptimized}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
