"use client"

import { cn } from "@/lib/utils"

interface PillProps {
  label?: string
  children?: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function Pill({ label, children, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap",
        active
          ? "bg-[#F97316] border-[#F97316] text-black"
          : "bg-transparent border-[#3F3F46] text-[#A1A1AA] hover:border-[#F97316] hover:text-[#FAFAFA]"
      )}
    >
      {children ?? label}
    </button>
  )
}
