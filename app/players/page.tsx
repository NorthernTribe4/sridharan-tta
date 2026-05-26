import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import { PlayersClient } from "./players-client"
import type { TeamMember } from "@/lib/types"

export const metadata: Metadata = {
  title: "Players",
  description: "Meet the players of Sridharan Table Tennis Academy — competitive athletes across all age categories.",
}

export default async function PlayersPage() {
  let players: TeamMember[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("role", "player")
      .order("display_order", { ascending: true })
    players = (data as TeamMember[] | null) ?? []
  } catch {
    players = []
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-6">
          <Eyebrow>Our People</Eyebrow>
          <h1 className="text-display font-heading text-white mb-4">Our Players</h1>
          <p className="text-[#A1A1AA] text-lg max-w-xl">
            Competitive athletes training at every level — from sub-youth beginners to senior champions.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-6 mb-12 py-6 border-y border-[#27272A]">
          {[
            { label: "Total Players", value: players.length },
            { label: "Senior", value: players.filter((p) => p.category === "senior").length },
            { label: "Junior", value: players.filter((p) => p.category === "junior").length },
            { label: "Youth & Sub-Youth", value: players.filter((p) => p.category === "youth" || p.category === "sub_youth").length },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-heading font-black text-white">{s.value}</p>
              <p className="text-xs text-[#71717A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <PlayersClient players={players} />
      </div>
    </main>
  )
}
