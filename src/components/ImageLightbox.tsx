'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { ZoomIn, X } from 'lucide-react'

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
            className={`relative group cursor-pointer overflow-hidden rounded ${fill ? 'w-full h-full' : ''}`}
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
      <DialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none p-0 border-0 md:w-auto md:h-auto md:max-w-[95vw] md:max-h-[95vh]">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Enlarged view of {alt}</DialogDescription>
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1440}
            className="w-full h-full md:w-auto md:h-auto md:max-w-full md:max-h-[95vh] object-contain"
            quality={90}
            loading="eager"
            unoptimized={unoptimized}
          />
          {/* Custom close button with white color and larger size */}
          <DialogClose className="absolute right-4 top-4 z-10 text-white hover:text-gray-300 transition-colors bg-transparent border-0 p-0">
            <X className="w-8 h-8 md:w-6 md:h-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
