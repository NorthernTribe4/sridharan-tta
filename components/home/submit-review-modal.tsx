"use client"

import { useState } from "react"
import { X, Star, CheckCircle } from "lucide-react"
import { submitReview } from "@/app/actions/review"

export function SubmitReviewModal() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [form, setForm] = useState({ reviewer_name: "", reviewer_role: "", review_text: "" })

  function close() {
    setOpen(false)
    setTimeout(() => {
      setSent(false)
      setError(null)
      setRating(0)
      setHovered(0)
      setForm({ reviewer_name: "", reviewer_role: "", review_text: "" })
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError("Please select a star rating."); return }
    setLoading(true)
    setError(null)
    const result = await submitReview({ ...form, rating })
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.error)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3F3F46] text-[#A1A1AA] text-sm font-semibold hover:border-[#F97316] hover:text-white transition-colors"
      >
        <Star size={14} className="text-[#EAB308]" />
        Leave a review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-[#1C1C20] border-b border-[#27272A] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-white text-lg">Leave a Review</h2>
                <p className="text-[#71717A] text-sm mt-0.5">Your review will appear after approval</p>
              </div>
              <button onClick={close} className="text-[#71717A] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {sent ? (
                <div className="py-8 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-white text-xl mb-2">Thank You!</h3>
                  <p className="text-[#A1A1AA] text-sm">Your review has been submitted and will appear once approved by our team.</p>
                  <button onClick={close} className="mt-6 px-5 py-2.5 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
                  )}

                  {/* Star rating */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">
                      Rating <span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          className="p-0.5 transition-transform hover:scale-110"
                          aria-label={`${star} star`}
                        >
                          <Star
                            size={28}
                            className={`transition-colors ${star <= (hovered || rating) ? "text-[#EAB308] fill-[#EAB308]" : "text-[#3F3F46]"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { id: "sr-name", label: "Your Name", key: "reviewer_name", placeholder: "Full name", required: true },
                    { id: "sr-role", label: "Your Role", key: "reviewer_role", placeholder: "e.g. Parent of student, Adult player…", required: false },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-sm font-medium text-white" htmlFor={f.id}>
                        {f.label}
                        {f.required && <span className="text-[#F97316] ml-0.5">*</span>}
                        {!f.required && <span className="text-[#71717A] font-normal text-xs ml-1">(optional)</span>}
                      </label>
                      <input
                        id={f.id}
                        required={f.required}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white" htmlFor="sr-text">
                      Your Review <span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <textarea
                      id="sr-text"
                      required
                      rows={4}
                      value={form.review_text}
                      onChange={(e) => setForm((p) => ({ ...p, review_text: e.target.value }))}
                      placeholder="Share your experience at Sridharan TTA…"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
