"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type { TeamMember } from "@/lib/types"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

interface MatchesFilterBarProps {
  players: TeamMember[]
  availableYears: number[]
}

export function MatchesFilterBar({ players, availableYears }: MatchesFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const month = searchParams.get("month") ?? ""
  const year = searchParams.get("year") ?? ""
  const playerId = searchParams.get("player") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`/matches?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clear = () => router.push("/matches")
  const hasFilters = !!(month || year || playerId)

  const selectClass =
    "px-3 py-2 rounded-lg border border-input bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--tta-navy)]/20 focus:border-[var(--tta-navy)] transition-colors"

  return (
    <div className="flex flex-wrap gap-3 items-center mb-8">
      <select
        value={month}
        onChange={(e) => update("month", e.target.value)}
        className={selectClass}
      >
        <option value="">All months</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={String(i + 1).padStart(2, "0")}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => update("year", e.target.value)}
        className={selectClass}
      >
        <option value="">All years</option>
        {availableYears.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={playerId}
        onChange={(e) => update("player", e.target.value)}
        className={selectClass}
      >
        <option value="">All players</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
