"use client"

import { useEffect, useRef, useState } from "react"

interface StatCounterProps {
  value: number
  suffix?: string
  label: string
}

export function StatCounter({ value, suffix = "", label }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true
          const duration = 1200
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + increment, value)
            setCount(Math.floor(current))
            if (current >= value) clearInterval(timer)
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading font-black text-5xl md:text-6xl text-white tabular-nums">
        {count}
        <span className="text-[#F97316]">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-[#A1A1AA] uppercase tracking-widest font-semibold">{label}</p>
    </div>
  )
}
