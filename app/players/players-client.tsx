"use client"

import { useState } from "react"
import { Pill } from "@/components/site/pill"
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

const CAT_LABELS: Record<string, string> = {
  all: "All",
  senior: "Senior",
  junior: "Junior",
  youth: "Youth",
  sub_youth: "Sub-Youth",
}

const categories = Object.keys(CAT_LABELS)

function PlayerCard({ player }: { player: TeamMember }) {
  const initials = player.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)
  return (
    <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#3F3F46] transition-colors">
      <div className="w-20 h-20 rounded-full bg-[#1C1C20] border-2 border-[#27272A] flex items-center justify-center overflow-hidden mx-auto">
        {player.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading font-bold text-2xl text-[#F97316]">{initials}</span>
        )}
      </div>

      <div className="text-center">
        <p className="font-heading font-bold text-white">{player.full_name}</p>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          {player.age && <span className="text-[#71717A] text-xs">Age {player.age}</span>}
          {player.years_training && (
            <span className="text-[#71717A] text-xs">· {player.years_training}y training</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {player.category && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-white/5 text-white/60 border-white/10 capitalize">
            {CAT_LABELS[player.category] ?? player.category}
          </span>
        )}
        {player.playing_style && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STYLE_COLORS[player.playing_style] ?? "bg-white/5 text-white/60 border-white/10"}`}>
            {STYLE_LABELS[player.playing_style] ?? player.playing_style}
          </span>
        )}
      </div>

      {player.achievements.length > 0 && (
        <ul className="space-y-1">
          {player.achievements.slice(0, 3).map((a, i) => (
            <li key={i} className="text-[#71717A] text-xs leading-relaxed flex items-start gap-1.5">
              <span className="text-[#F97316] mt-0.5 shrink-0">·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PlayersClient({ players }: { players: TeamMember[] }) {
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered = activeCategory === "all"
    ? players
    : players.filter((p) => p.category === activeCategory)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((c) => (
          <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>
            {CAT_LABELS[c]}
          </Pill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#71717A]">No players in this category.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </>
  )
}
