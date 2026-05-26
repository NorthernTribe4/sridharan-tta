import { Trophy } from "lucide-react"
import { SetScorePill } from "./set-score-pill"
import { formatMatchDate } from "@/lib/utils"
import { setWinnerSide } from "@/lib/tt-rules"
import type { MatchWithSets } from "@/lib/types"

export function MatchRow({ match }: { match: MatchWithSets }) {
  const isP1Winner = match.winner_id === match.player1_id
  const isP2Winner = match.winner_id === match.player2_id

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Red accent bar for winner side */}
        <div className="w-1 shrink-0 bg-[var(--tta-red)]" />

        <div className="flex-1 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Date */}
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums w-24">
              {formatMatchDate(match.match_date)}
            </span>

            {/* Players */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Player 1 */}
              <div className={`flex items-center gap-1.5 ${isP1Winner ? "font-bold text-[var(--tta-navy)]" : "text-muted-foreground"}`}>
                {isP1Winner && <Trophy size={13} className="text-[var(--tta-red)] shrink-0" />}
                <span className="text-sm">{match.player1.full_name}</span>
              </div>

              <span className="text-xs text-muted-foreground hidden sm:block">vs</span>

              {/* Player 2 */}
              <div className={`flex items-center gap-1.5 ${isP2Winner ? "font-bold text-[var(--tta-navy)]" : "text-muted-foreground"}`}>
                {isP2Winner && <Trophy size={13} className="text-[var(--tta-red)] shrink-0" />}
                <span className="text-sm">{match.player2.full_name}</span>
              </div>
            </div>

            {/* Set scores */}
            <div className="flex flex-wrap gap-1 sm:justify-end">
              {match.sets
                .sort((a, b) => a.set_number - b.set_number)
                .map((s) => {
                  const side = setWinnerSide(s.player1_score, s.player2_score)
                  if (!side) return null
                  return (
                    <SetScorePill
                      key={s.set_number}
                      p1={s.player1_score}
                      p2={s.player2_score}
                      winnerSide={side}
                    />
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
