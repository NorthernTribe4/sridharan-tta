"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addMagazine(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("magazines").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    cover_image: formData.get("cover_image") as string,
    pdf_url: formData.get("pdf_url") as string,
    issue_date: formData.get("issue_date") as string,
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/magazines")
  revalidatePath("/media/magazines")
  return { ok: true }
}

export async function deleteMagazine(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("magazines").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/magazines")
  revalidatePath("/media/magazines")
  return { ok: true }
}
