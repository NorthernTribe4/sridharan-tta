import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function requireAdmin(next: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/admin/login?next=${next}`)
  const { data: authorized } = await supabase.rpc("is_authorized_scorer")
  if (!authorized) redirect("/admin/scores")
  return { supabase, user }
}
