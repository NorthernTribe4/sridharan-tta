"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { scoreSchema } from "./schema"
import { matchWinnerFromSets } from "@/lib/tt-rules"
import type { ScoreEntryFormValues } from "@/lib/types"

export async function submitMatch(
  raw: ScoreEntryFormValues
): Promise<{ ok: true; winnerName: string } | { ok: false; error: string }> {
  // 1. Validate
  const parsed = scoreSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: "Invalid form data" }
  }
  const data = parsed.data

  const supabase = await createClient()

  // 2. Auth gate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  const { data: authorized } = await supabase.rpc("is_authorized_scorer")
  if (!authorized) return { ok: false, error: "Not authorized to enter scores" }

  // 3. Client-side winner check (mirrors the DB trigger)
  const computedWinner = matchWinnerFromSets(
    data.sets,
    data.player1_id,
    data.player2_id,
    data.best_of
  )
  if (!computedWinner) {
    return { ok: false, error: "Match is not yet decided — enter the remaining sets" }
  }

  // 4. Insert match row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match, error: matchErr } = await (supabase as any)
    .from("matches")
    .insert({
      match_date: data.match_date,
      player1_id: data.player1_id,
      player2_id: data.player2_id,
      best_of: data.best_of,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (matchErr || !match) {
    return { ok: false, error: (matchErr as { message?: string } | null)?.message ?? "Failed to create match" }
  }

  const matchId = (match as { id: string }).id

  // 5. Insert sets (trigger fires after each insert → winner_id auto-computed)
  const setsToInsert = data.sets.map((s, i) => ({
    match_id: matchId,
    set_number: i + 1,
    player1_score: s.player1_score,
    player2_score: s.player2_score,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: setsErr } = await (supabase as any).from("match_sets").insert(setsToInsert)

  if (setsErr) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("matches").delete().eq("id", matchId)
    return { ok: false, error: (setsErr as { message?: string }).message ?? "Failed to save sets" }
  }

  // 6. Verify trigger computed a winner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated } = await (supabase as any)
    .from("matches")
    .select("winner_id")
    .eq("id", matchId)
    .single()

  if (!(updated as { winner_id: string | null } | null)?.winner_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("matches").delete().eq("id", matchId)
    return { ok: false, error: "Match incomplete — winner could not be determined" }
  }

  // Resolve winner name from players list (already validated above)
  const winnerId = (updated as { winner_id: string }).winner_id
  const isP1 = winnerId === data.player1_id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: winner } = await (supabase as any)
    .from("team_members")
    .select("full_name")
    .eq("id", winnerId)
    .single()

  const winnerName = (winner as { full_name: string } | null)?.full_name ?? (isP1 ? "Player 1" : "Player 2")

  revalidatePath("/matches")
  return { ok: true, winnerName }
}
