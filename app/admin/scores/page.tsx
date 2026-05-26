import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ScoreEntryForm } from "./score-entry-form"
import { Section } from "@/components/site/section"
import { AdminTabNav } from "@/components/admin/admin-tab-nav"
import type { TeamMember } from "@/lib/types"

export const metadata: Metadata = {
  title: "Score Entry",
  robots: { index: false, follow: false },
}

export default async function ScoresPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login?next=/admin/scores")

  const { data: authorized } = await supabase.rpc("is_authorized_scorer")

  if (!authorized) {
    return (
      <Section tight>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-[var(--tta-navy)] mb-3">
            Not Authorized
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your account ({user.email}) is not listed as an authorized scorer.
            Ask the academy admin to add your user ID to the authorized scorers list.
          </p>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </Section>
    )
  }

  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("role", "player")
    .order("display_order", { ascending: true })

  const players: TeamMember[] = (data as TeamMember[] | null) ?? []

  return (
    <>
      <div className="bg-[var(--tta-navy)] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <span className="text-[var(--tta-red)] font-semibold text-sm uppercase tracking-widest">
              Admin
            </span>
            <h1 className="font-heading font-extrabold text-3xl mt-1 text-white">
              Score Entry
            </h1>
          </div>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
        <AdminTabNav />
      </div>

      <Section tight>
        <div className="max-w-2xl mx-auto">
          {players.length < 2 ? (
            <div className="text-center py-16 text-muted-foreground">
              At least 2 players must be in the database before you can enter a match.
            </div>
          ) : (
            <ScoreEntryForm players={players} />
          )}
        </div>
      </Section>
    </>
  )
}
