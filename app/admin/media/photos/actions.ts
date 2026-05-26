"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addPhoto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("media_photos").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    photo_url: formData.get("photo_url") as string,
    category: formData.get("category") as string,
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/photos")
  revalidatePath("/media/photos")
  return { ok: true }
}

export async function deletePhoto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("media_photos").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/photos")
  revalidatePath("/media/photos")
  return { ok: true }
}
