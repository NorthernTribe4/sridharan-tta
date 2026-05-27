import { User } from "lucide-react"
import type { TeamMember } from "@/lib/types"

const roleColors: Record<string, string> = {
  founder: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
  manager: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  coach: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  player: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

const roleLabel: Record<string, string> = {
  founder: "Founder",
  manager: "Manager",
  coach: "Coach",
  player: "Player",
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 hover:border-[#F97316]/30 flex flex-col items-center text-center group lift">
      {/* Circular photo */}
      <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#1C1C20] border-2 border-[#27272A] group-hover:border-[#F97316]/40 transition-colors mb-4">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {member.full_name ? (
              <span className="font-heading font-bold text-2xl text-[#F97316]">
                {initials(member.full_name)}
              </span>
            ) : (
              <User size={36} className="text-[#3F3F46]" />
            )}
          </div>
        )}
      </div>

      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColors[member.role] ?? "bg-white/5 text-white/60 border-white/10"} mb-3`}>
        {member.short_label ?? roleLabel[member.role] ?? member.role}
      </span>

      <h3 className="font-heading font-bold text-white text-base leading-tight mb-2">
        {member.full_name}
      </h3>

      <p className="text-[#A1A1AA] text-xs leading-relaxed mb-4">
        {member.bio}
      </p>

      {member.achievements.length > 0 && (
        <ul className="space-y-1 w-full text-left mt-auto pt-4 border-t border-[#27272A]">
          {member.achievements.slice(0, 3).map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-[#71717A]">
              <span className="text-[#F97316] mt-0.5 shrink-0">·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
