"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface LightboxImage {
  src: string
  title: string
  description?: string | null
}

interface LightboxModalProps {
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
}

export function LightboxModal({ images, initialIndex, onClose }: LightboxModalProps) {
  const [index, setIndex] = useState(initialIndex)

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  const current = images[index]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/40 rounded-full p-2"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/40 rounded-full p-2"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="max-w-5xl w-full px-16">
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
          <Image
            src={current.src}
            alt={current.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        {(current.title || current.description) && (
          <div className="mt-4 text-center">
            <p className="font-heading font-bold text-white text-lg">{current.title}</p>
            {current.description && (
              <p className="text-[#A1A1AA] text-sm mt-1">{current.description}</p>
            )}
          </div>
        )}
        {images.length > 1 && (
          <p className="text-center text-[#71717A] text-xs mt-2">{index + 1} / {images.length}</p>
        )}
      </div>
    </div>
  )
}
