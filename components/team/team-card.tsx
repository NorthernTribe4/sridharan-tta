import Image from "next/image"
import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TeamMember } from "@/lib/types"

const roleColors: Record<string, string> = {
  founder: "bg-[var(--tta-navy)] text-white",
  manager: "bg-zinc-700 text-white",
  coach: "bg-[var(--tta-red)] text-white",
  player: "bg-[var(--tta-yellow)] text-[var(--tta-navy)]",
}

const roleLabel: Record<string, string> = {
  founder: "Founder",
  manager: "Manager",
  coach: "Coach",
  player: "Player",
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Photo */}
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.full_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
            <User size={48} className="text-zinc-300" />
          </div>
        )}

        {/* Role badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[member.role] ?? "bg-zinc-200"}`}
          >
            {member.short_label ?? roleLabel[member.role] ?? member.role}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-[var(--tta-navy)] text-lg leading-tight mb-1">
          {member.full_name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
          {member.bio}
        </p>

        {member.achievements.length > 0 && (
          <ul className="space-y-1">
            {member.achievements.map((a) => (
              <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-[var(--tta-red)] mt-0.5 shrink-0">✦</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
