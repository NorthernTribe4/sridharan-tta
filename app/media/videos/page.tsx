import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import { VideoGalleryClient } from "./video-gallery-client"
import type { MediaVideo } from "@/lib/types"

export const metadata: Metadata = {
  title: "Video Gallery",
  description: "Watch match highlights, coaching drills, and championship moments from Sridharan TTA.",
}

export default async function VideosPage() {
  let videos: MediaVideo[] = []
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("media_videos")
      .select("*")
      .order("uploaded_at", { ascending: false })
    videos = (data as MediaVideo[] | null) ?? []
  } catch {
    videos = []
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Eyebrow>Media</Eyebrow>
          <h1 className="text-section font-heading text-white mb-2">Video Gallery</h1>
          <p className="text-[#A1A1AA] text-sm">{videos.length} videos</p>
        </div>
        <VideoGalleryClient videos={videos} />
      </div>
    </main>
  )
}
