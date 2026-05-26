"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addVideo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("media_videos").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    video_url: formData.get("video_url") as string,
    thumbnail_url: (formData.get("thumbnail_url") as string) || null,
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/videos")
  revalidatePath("/media/videos")
  return { ok: true }
}

export async function deleteVideo(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("media_videos").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/videos")
  revalidatePath("/media/videos")
  return { ok: true }
}
