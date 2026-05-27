import Link from "next/link"
import { Eyebrow } from "@/components/site/eyebrow"
import { Carousel } from "@/components/site/carousel"
import { createClient } from "@/lib/supabase/server"
import type { TeamMember } from "@/lib/types"

const STYLE_LABELS: Record<string, string> = {
  attacking: "Attacking",
  all_round: "All-round",
  defensive: "Defensive",
  power: "Power",
  spin: "Spin",
}

const STYLE_COLORS: Record<string, string> = {
  attacking: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
  all_round: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  defensive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  power: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  spin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

function PlayerCard({ player }: { player: TeamMember }) {
  const initials = player.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)

  return (
    <div className="snap-start shrink-0 w-56 bg-[#141416] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#F97316]/30 lift">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-[#1C1C20] border-2 border-[#27272A] flex items-center justify-center overflow-hidden">
        {player.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading font-bold text-xl text-[#F97316]">{initials}</span>
        )}
      </div>

      <div>
        <p className="font-heading font-bold text-white text-sm">{player.full_name}</p>
        {player.age && <p className="text-[#71717A] text-xs mt-0.5">Age {player.age}</p>}
      </div>

      {player.playing_style && (
        <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full border ${STYLE_COLORS[player.playing_style] ?? "bg-white/5 text-white/60 border-white/10"}`}>
          {STYLE_LABELS[player.playing_style] ?? player.playing_style}
        </span>
      )}

      {player.achievements.length > 0 && (
        <p className="text-[#71717A] text-xs leading-relaxed line-clamp-2">
          {player.achievements[0]}
        </p>
      )}
    </div>
  )
}

export async function FeaturedPlayers() {
  let players: TeamMember[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("role", "player")
      .order("display_order", { ascending: true })
      .limit(10)
    players = (data as TeamMember[] | null) ?? []
  } catch {
    players = []
  }

  if (players.length === 0) return null

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Eyebrow>Players</Eyebrow>
            <h2 className="text-section font-heading text-white">Meet our players</h2>
          </div>
          <Link
            href="/players"
            className="hidden sm:inline-flex text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors"
          >
            View all players →
          </Link>
        </div>

        <Carousel>
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
          <div className="snap-start shrink-0 w-56 flex items-center justify-center">
            <Link
              href="/players"
              className="text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors"
            >
              View all players →
            </Link>
          </div>
        </Carousel>
      </div>
    </section>
  )
}
