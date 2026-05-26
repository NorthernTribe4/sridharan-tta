import { cn } from "@/lib/utils"

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn(
      "text-xs font-bold uppercase tracking-[0.2em] text-[#F97316] mb-3",
      className
    )}>
      {children}
    </p>
  )
}
