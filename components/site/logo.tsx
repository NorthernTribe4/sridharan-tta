import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className ?? ""}`}>
      <span className="w-8 h-8 rounded-lg bg-[var(--tta-red)] flex items-center justify-center text-white font-bold text-sm font-heading select-none">
        S
      </span>
      <span className="font-heading font-bold text-lg leading-tight text-inherit">
        Sridharan TTA
      </span>
    </Link>
  )
}
