import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import { TeamSection } from "@/components/team/team-section"
import type { TeamMember } from "@/lib/types"

export const metadata: Metadata = {
  title: "Coaches & Staff",
  description: "Meet the founder, managers, and coaches of Sridharan Table Tennis Academy in Chennai.",
}

export default async function TeamPage() {
  let members: TeamMember[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .in("role", ["founder", "manager", "coach"])
      .order("display_order", { ascending: true })
    members = (data as TeamMember[] | null) ?? []
  } catch {
    members = []
  }

  const founders = members.filter((m) => m.role === "founder")
  const managers = members.filter((m) => m.role === "manager")
  const coaches = members.filter((m) => m.role === "coach")

  return (
    <main className="min-h-screen bg-[#0A0A0B] pb-20">
      {/* Hero */}
      <div className="bg-[#141416] border-b border-[#27272A] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Eyebrow>Our People</Eyebrow>
          <h1 className="text-display font-heading text-white mt-3 mb-4">Coaches & Staff</h1>
          <p className="text-[#A1A1AA] text-lg max-w-xl">
            The founder, managers, and coaches who built Sridharan TTA and drive its mission every day.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        {members.length === 0 ? (
          <p className="text-[#71717A] text-center py-24">Team roster is being updated — check back soon.</p>
        ) : (
          <>
            {founders.length > 0 && (
              <div id="founders" className="scroll-mt-28">
                <TeamSection title="Founders" subtitle="The vision behind the academy" members={founders} />
              </div>
            )}
            {coaches.length > 0 && (
              <TeamSection title="Coaches" subtitle="Our certified coaching staff" members={coaches} />
            )}
            {managers.length > 0 && (
              <TeamSection title="Management" subtitle="Keeping the academy running" members={managers} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
