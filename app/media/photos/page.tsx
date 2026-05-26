import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import { PhotoGalleryClient } from "./photo-gallery-client"
import type { MediaPhoto } from "@/lib/types"

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Photos from training, matches, events, and facilities at Sridharan TTA.",
}

export default async function PhotosPage() {
  let photos: MediaPhoto[] = []
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("media_photos")
      .select("*")
      .order("uploaded_at", { ascending: false })
    photos = (data as MediaPhoto[] | null) ?? []
  } catch {
    photos = []
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Eyebrow>Media</Eyebrow>
          <h1 className="text-section font-heading text-white mb-2">Photo Gallery</h1>
          <p className="text-[#A1A1AA] text-sm">{photos.length} photos</p>
        </div>
        <PhotoGalleryClient photos={photos} />
      </div>
    </main>
  )
}
