"use server"

import { createClient } from "@/lib/supabase/server"

interface ReviewInput {
  reviewer_name: string
  reviewer_role: string
  rating: number
  review_text: string
}

export async function submitReview(
  data: ReviewInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!data.reviewer_name.trim() || !data.review_text.trim()) {
    return { ok: false, error: "Name and review are required." }
  }
  if (data.rating < 1 || data.rating > 5) {
    return { ok: false, error: "Please select a rating." }
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("reviews").insert({
    reviewer_name: data.reviewer_name.trim(),
    reviewer_role: data.reviewer_role.trim() || "Academy member",
    rating: data.rating,
    review_text: data.review_text.trim(),
    is_approved: false,
  })

  if (error) {
    return { ok: false, error: (error as { message?: string }).message ?? "Failed to submit review." }
  }

  return { ok: true }
}
