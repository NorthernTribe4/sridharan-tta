"use client"

import { useState, useTransition } from "react"
import { CheckCircle, Trash2 } from "lucide-react"
import { approveReview, deleteReview } from "./actions"
import type { Review } from "@/lib/types"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-[var(--tta-yellow)]" : "text-gray-200"}`}
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function ReviewsClient({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial)
  const [, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  function handleApprove(id: string) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: true } : r))
    setActionError(null)
    startTransition(async () => {
      const result = await approveReview(id)
      if (!result.ok) setActionError(result.error ?? "Failed to approve")
    })
  }

  function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setActionError(null)
    startTransition(async () => {
      const result = await deleteReview(id)
      if (!result.ok) setActionError(result.error ?? "Failed to delete")
    })
  }

  const pending = reviews.filter((r) => !r.is_approved)
  const approved = reviews.filter((r) => r.is_approved)

  return (
    <div className="space-y-8">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-white text-base mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={() => handleApprove(review.id)}
                onDelete={() => handleDelete(review.id)}
              />
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-white text-base mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Approved ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={() => handleDelete(review.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  review,
  onApprove,
  onDelete,
}: {
  review: Review
  onApprove?: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        review.is_approved ? "bg-white border-border" : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[var(--tta-navy)] text-sm">{review.reviewer_name}</p>
            <span className="text-xs text-muted-foreground">{review.reviewer_role}</span>
            {!review.is_approved && (
              <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                Pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-medium transition-colors border border-green-200 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg"
            >
              <CheckCircle size={13} />
              Approve
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium transition-colors border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
    </div>
  )
}
