import { TeamCard } from "./team-card"
import type { TeamMember } from "@/lib/types"

interface TeamSectionProps {
  title: string
  subtitle?: string
  members: TeamMember[]
}

export function TeamSection({ title, subtitle, members }: TeamSectionProps) {
  if (members.length === 0) return null

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full bg-[#F97316]" />
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-[#71717A] text-sm ml-4 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {members.map((m) => (
          <TeamCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  )
}
