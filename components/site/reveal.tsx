"use client"

import { useEffect, useRef, useState } from "react"

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: "div" | "section"
}

export function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const Tag = as
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </Tag>
  )
}
