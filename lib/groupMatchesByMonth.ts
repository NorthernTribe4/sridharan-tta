import { format, parseISO } from 'date-fns'
import type { MatchWithSets, MatchesByMonth } from './types'

export function groupMatchesByMonth(matches: MatchWithSets[]): MatchesByMonth[] {
  const map = new Map<string, MatchWithSets[]>()

  for (const match of matches) {
    const date = parseISO(match.match_date)
    const key = format(date, 'yyyy-MM')
    const existing = map.get(key) ?? []
    existing.push(match)
    map.set(key, existing)
  }

  return Array.from(map.entries()).map(([key, ms]) => ({
    monthKey: key,
    monthLabel: format(parseISO(`${key}-01`), 'MMMM yyyy'),
    matches: ms,
  }))
}
