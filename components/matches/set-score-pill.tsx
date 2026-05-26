import { cn } from "@/lib/utils"

interface SetScorePillProps {
  p1: number
  p2: number
  winnerSide: 1 | 2
}

export function SetScorePill({ p1, p2, winnerSide }: SetScorePillProps) {
  return (
    <span className="inline-flex items-center gap-0.5 bg-zinc-100 rounded-md px-2 py-0.5 text-xs font-mono tabular-nums border border-zinc-200">
      <span className={cn("font-bold", winnerSide === 1 ? "text-[var(--tta-red)]" : "text-zinc-500")}>
        {p1}
      </span>
      <span className="text-zinc-300 mx-0.5">–</span>
      <span className={cn("font-bold", winnerSide === 2 ? "text-[var(--tta-red)]" : "text-zinc-500")}>
        {p2}
      </span>
    </span>
  )
}
