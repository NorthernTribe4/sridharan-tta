import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-guard"
import { AdminTabNav } from "@/components/admin/admin-tab-nav"
import { MagazinesAdminClient } from "./magazines-client"
import type { Magazine } from "@/lib/types"

export const metadata: Metadata = {
  title: "Magazines — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminMagazinesPage() {
  const { supabase, user } = await requireAdmin("/admin/media/magazines")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("magazines")
    .select("*")
    .order("issue_date", { ascending: false })

  const magazines: Magazine[] = (data as Magazine[] | null) ?? []

  return (
    <>
      <div className="bg-[#0A0A0B] border-b border-[#27272A] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <span className="text-[#F97316] font-semibold text-sm uppercase tracking-widest">Admin</span>
            <h1 className="font-heading font-extrabold text-3xl mt-1 text-white">Magazines</h1>
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
          <MagazinesAdminClient magazines={magazines} />
        </div>
      </div>
    </>
  )
}
