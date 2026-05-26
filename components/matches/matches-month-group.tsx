import { MatchRow } from "./match-row"
import type { MatchesByMonth } from "@/lib/types"

export function MatchesMonthGroup({ group }: { group: MatchesByMonth }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-heading font-bold text-[var(--tta-navy)] text-xl">
          {group.monthLabel}
        </h2>
        <span className="text-xs text-muted-foreground bg-zinc-100 rounded-full px-2.5 py-0.5 border border-zinc-200">
          {group.matches.length} {group.matches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <div className="space-y-3">
        {group.matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </div>
  )
}
