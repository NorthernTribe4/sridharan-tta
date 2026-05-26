import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-guard"
import { AdminTabNav } from "@/components/admin/admin-tab-nav"
import { VideosAdminClient } from "./videos-client"
import type { MediaVideo } from "@/lib/types"

export const metadata: Metadata = {
  title: "Videos — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminVideosPage() {
  const { supabase, user } = await requireAdmin("/admin/media/videos")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("media_videos")
    .select("*")
    .order("uploaded_at", { ascending: false })

  const videos: MediaVideo[] = (data as MediaVideo[] | null) ?? []

  return (
    <>
      <div className="bg-[#0A0A0B] border-b border-[#27272A] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <span className="text-[#F97316] font-semibold text-sm uppercase tracking-widest">Admin</span>
            <h1 className="font-heading font-extrabold text-3xl mt-1 text-white">Video Gallery</h1>
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
          <VideosAdminClient videos={videos} />
        </div>
      </div>
    </>
  )
}
