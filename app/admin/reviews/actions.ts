"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function guardAuthorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, ok: false as const, error: "Not authenticated" }
  const { data: authorized } = await supabase.rpc("is_authorized_scorer")
  if (!authorized) return { supabase, ok: false as const, error: "Not authorized" }
  return { supabase, ok: true as const, error: null }
}

export async function approveReview(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok, error } = await guardAuthorized()
  if (!ok) return { ok: false, error }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbErr } = await (supabase as any)
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", id)

  if (dbErr) return { ok: false, error: (dbErr as { message?: string }).message }

  revalidatePath("/admin/reviews")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteReview(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok, error } = await guardAuthorized()
  if (!ok) return { ok: false, error }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbErr } = await (supabase as any)
    .from("reviews")
    .delete()
    .eq("id", id)

  if (dbErr) return { ok: false, error: (dbErr as { message?: string }).message }

  revalidatePath("/admin/reviews")
  revalidatePath("/")
  return { ok: true }
}

export async function markMessageRead(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, ok, error } = await guardAuthorized()
  if (!ok) return { ok: false, error }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbErr } = await (supabase as any)
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id)

  if (dbErr) return { ok: false, error: (dbErr as { message?: string }).message }

  revalidatePath("/admin/messages")
  return { ok: true }
}
