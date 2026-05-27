"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TeamRole } from "@/lib/types"

interface TeamMemberInput {
  id?: string
  full_name: string
  role: TeamRole
  bio: string
  achievements: string[]
  photo_url: string | null
  display_order: number
  short_label: string | null
  category: 'senior' | 'junior' | 'youth' | 'sub_youth' | null
  playing_style: 'attacking' | 'all_round' | 'defensive' | 'power' | 'spin' | null
  age: number | null
  years_training: number | null
}

export async function saveTeamMember(input: TeamMemberInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  const payload = {
    full_name: input.full_name.trim(),
    role: input.role,
    bio: input.bio.trim(),
    achievements: input.achievements.filter((a) => a.trim().length > 0),
    photo_url: input.photo_url,
    display_order: input.display_order,
    short_label: input.short_label,
    category: input.category,
    playing_style: input.playing_style,
    age: input.age,
    years_training: input.years_training,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { error } = input.id
    ? await sb.from("team_members").update(payload).eq("id", input.id)
    : await sb.from("team_members").insert(payload)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/team")
  revalidatePath("/team")
  revalidatePath("/players")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteTeamMember(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("team_members").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/team")
  revalidatePath("/team")
  revalidatePath("/players")
  revalidatePath("/")
  return { ok: true }
}
