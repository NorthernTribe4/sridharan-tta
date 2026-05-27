import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import { SubmitReviewModal } from "./submit-review-modal"
import type { Review } from "@/lib/types"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#EAB308]" : "text-[#27272A]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export async function ReviewsSection() {
  let reviews: Review[] = []

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(6)
    reviews = (data as Review[] | null) ?? []
  } catch {
    reviews = []
  }

  if (reviews.length === 0) return null

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto">
        <Eyebrow>Testimonials</Eyebrow>
        <h2 className="text-section font-heading text-white mb-4">What our community says</h2>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <p className="text-[#A1A1AA] max-w-xl">
            Hear from the parents, students, and players who train at Sridharan TTA.
          </p>
          <SubmitReviewModal />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#F97316]/30 lift"
            >
              <StarRating rating={review.rating} />
              <blockquote className="text-sm text-[#A1A1AA] leading-relaxed flex-1">
                &ldquo;{review.review_text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-3 border-t border-[#27272A]">
                <div className="w-9 h-9 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#F97316] font-bold text-sm">
                    {review.reviewer_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{review.reviewer_name}</p>
                  <p className="text-xs text-[#71717A]">{review.reviewer_role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
