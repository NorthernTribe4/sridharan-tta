"use server"

import { createClient } from "@/lib/supabase/server"

interface ContactInput {
  name: string
  email: string
  phone: string
  message: string
}

export async function submitContact(
  data: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    return { ok: false, error: "Name, email, and message are required." }
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("contact_messages").insert({
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim() || null,
    message: data.message.trim(),
  })

  if (error) {
    return { ok: false, error: (error as { message?: string }).message ?? "Failed to send message." }
  }

  return { ok: true }
}
