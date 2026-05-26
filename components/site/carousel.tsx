"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps {
  children: React.ReactNode
  className?: string
}

export function Carousel({ children, className }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    if (!ref.current) return
    const amount = ref.current.clientWidth * 0.75
    ref.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" })
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={ref}
        className="snap-x-mandatory flex gap-5 pb-4"
      >
        {children}
      </div>
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#141416] border border-[#27272A] text-white hover:border-[#F97316] transition-colors shadow-lg z-10"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#141416] border border-[#27272A] text-white hover:border-[#F97316] transition-colors shadow-lg z-10"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
