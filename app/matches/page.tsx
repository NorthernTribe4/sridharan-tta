import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { MatchesFilterBar } from "@/components/matches/matches-filter-bar"
import { MatchesMonthGroup } from "@/components/matches/matches-month-group"
import { Section } from "@/components/site/section"
import { groupMatchesByMonth } from "@/lib/groupMatchesByMonth"
import type { MatchWithSets, TeamMember } from "@/lib/types"

export const metadata: Metadata = {
  title: "Match Results",
  description: "View all match results from Sridharan Table Tennis Academy, grouped by month.",
}

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string; player?: string }>
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const { month, year, player } = await searchParams
  const supabase = await createClient()

  // Fetch players for filter bar
  const { data: playersData } = await supabase
    .from("team_members")
    .select("id, full_name, role, bio, achievements, photo_url, display_order, short_label, created_at, updated_at")
    .eq("role", "player")
    .order("display_order")

  const players: TeamMember[] = (playersData as TeamMember[] | null) ?? []

  // Build query
  let query = supabase
    .from("matches")
    .select(`
      id, match_date, player1_id, player2_id, best_of, winner_id, created_by, created_at, updated_at,
      player1:team_members!matches_player1_id_fkey(id, full_name, short_label, photo_url),
      player2:team_members!matches_player2_id_fkey(id, full_name, short_label, photo_url),
      winner:team_members!matches_winner_id_fkey(id, full_name),
      sets:match_sets(id, match_id, set_number, player1_score, player2_score, created_at)
    `)
    .order("match_date", { ascending: false })

  if (month && year) {
    const y = parseInt(year)
    const m = parseInt(month)
    const start = `${y}-${String(m).padStart(2, "0")}-01`
    const endMonth = m === 12 ? 1 : m + 1
    const endYear = m === 12 ? y + 1 : y
    const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`
    query = query.gte("match_date", start).lt("match_date", end)
  } else if (year) {
    query = query.gte("match_date", `${year}-01-01`).lt("match_date", `${parseInt(year) + 1}-01-01`)
  }

  if (player) {
    query = query.or(`player1_id.eq.${player},player2_id.eq.${player}`)
  }

  const { data: matchesData } = await query

  const matches = (matchesData ?? []) as unknown as MatchWithSets[]
  const groups = groupMatchesByMonth(matches)

  // Derive available years from all matches (unfiltered) for the year dropdown
  const { data: yearsData } = await supabase
    .from("matches")
    .select("match_date")
    .order("match_date", { ascending: false })

  const availableYears = Array.from(
    new Set(
      ((yearsData ?? []) as { match_date: string }[]).map((m) =>
        new Date(m.match_date).getFullYear()
      )
    )
  ).sort((a, b) => b - a)

  return (
    <>
      <div className="bg-[var(--tta-navy)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[var(--tta-red)] font-semibold text-sm uppercase tracking-widest">
            Results
          </span>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mt-2 text-white">
            Match Results
          </h1>
          <p className="text-white/60 mt-4 max-w-xl text-lg">
            All academy matches, newest first.
          </p>
        </div>
      </div>

      <Section>
        <MatchesFilterBar players={players} availableYears={availableYears} />

        {groups.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {month || year || player
                ? "No matches found for the selected filters."
                : "No matches recorded yet — check back soon."}
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <MatchesMonthGroup key={group.monthKey} group={group} />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
