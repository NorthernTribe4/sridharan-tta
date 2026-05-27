import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-guard"
import { AdminTabNav } from "@/components/admin/admin-tab-nav"
import { TeamAdminClient } from "./team-admin-client"
import type { TeamMember } from "@/lib/types"

export const metadata: Metadata = {
  title: "Team — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminTeamPage() {
  const { supabase, user } = await requireAdmin("/admin/team")

  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })

  const members: TeamMember[] = (data as TeamMember[] | null) ?? []

  return (
    <>
      <div className="bg-[#0A0A0B] border-b border-[#27272A] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <span className="text-[#F97316] font-semibold text-sm uppercase tracking-widest">Admin</span>
            <h1 className="font-heading font-extrabold text-3xl mt-1 text-white">Team Members</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">{user.email}</span>
            <form action="/admin/logout" method="POST">
              <button type="submit" className="text-sm text-white/60 hover:text-white transition-colors">Sign Out</button>
            </form>
          </div>
        </div>
        <AdminTabNav />
      </div>

      <div className="bg-[#0A0A0B] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <TeamAdminClient members={members} />
        </div>
      </div>
    </>
  )
}
