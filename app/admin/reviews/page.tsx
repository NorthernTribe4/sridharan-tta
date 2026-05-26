import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Section } from "@/components/site/section"
import { AdminTabNav } from "@/components/admin/admin-tab-nav"
import { ReviewsClient } from "./reviews-client"
import type { Review } from "@/lib/types"

export const metadata: Metadata = {
  title: "Reviews — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login?next=/admin/reviews")

  const { data: authorized } = await supabase.rpc("is_authorized_scorer")
  if (!authorized) redirect("/admin/scores")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("reviews")
    .select("*")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false })

  const reviews: Review[] = (data as Review[] | null) ?? []
  const pendingCount = reviews.filter((r) => !r.is_approved).length

  return (
    <>
      <div className="bg-[var(--tta-navy)] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <span className="text-[var(--tta-red)] font-semibold text-sm uppercase tracking-widest">
              Admin
            </span>
            <h1 className="font-heading font-extrabold text-3xl mt-1 text-white">
              Reviews
              {pendingCount > 0 && (
                <span className="ml-3 text-base font-semibold bg-[var(--tta-yellow)] text-[var(--tta-navy)] px-2.5 py-0.5 rounded-full align-middle">
                  {pendingCount} pending
                </span>
              )}
            </h1>
          </div>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign Out
            </button>
          </form>
        </div>
        <AdminTabNav />
      </div>

      <Section tight>
        <div className="max-w-3xl mx-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No reviews yet. They'll appear here when visitors submit a review.
            </div>
          ) : (
            <ReviewsClient reviews={reviews} />
          )}
        </div>
      </Section>
    </>
  )
}
