"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/slugify"

export async function addArticle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  const title = formData.get("title") as string
  const slug = slugify(title) + "-" + Date.now().toString(36)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("news_articles").insert({
    title,
    slug,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    author: formData.get("author") as string,
    featured_image: (formData.get("featured_image") as string) || null,
    is_published: formData.get("is_published") === "true",
    published_at: new Date().toISOString(),
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/news")
  revalidatePath("/media/news")
  return { ok: true }
}

export async function togglePublish(id: string, current: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("news_articles")
    .update({ is_published: !current })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/news")
  revalidatePath("/media/news")
  return { ok: true }
}

export async function deleteArticle(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("news_articles").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/media/news")
  revalidatePath("/media/news")
  return { ok: true }
}
