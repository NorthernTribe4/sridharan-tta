"use client"

import { useState } from "react"
import { X, MessageSquarePlus, CheckCircle } from "lucide-react"
import { submitContact } from "@/app/actions/contact"

const CATEGORIES = [
  "New page or section",
  "Better navigation",
  "More photos / videos",
  "Player profiles",
  "Online registration",
  "Other",
]

export function WebsiteFeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0] ?? "", suggestion: "" })

  function close() {
    setOpen(false)
    setTimeout(() => {
      setSent(false)
      setError(null)
      setForm({ name: "", category: CATEGORIES[0] ?? "", suggestion: "" })
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await submitContact({
      name: form.name || "Anonymous",
      email: "website-feedback@internal",
      phone: "",
      message: `[WEBSITE SUGGESTION — ${form.category}]\n\n${form.suggestion}`,
    })
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.error)
  }

  return (
    <>
      {/* Floating tab */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#1C1C20] border border-[#3F3F46] border-r-0 text-[#A1A1AA] hover:text-white hover:border-[#F97316]/50 hover:bg-[#27272A] transition-all px-3 py-4 rounded-l-xl shadow-lg"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          aria-label="Suggest something for the website"
        >
          <MessageSquarePlus size={15} className="rotate-90" />
          <span className="text-xs font-semibold tracking-wide rotate-180">Suggest</span>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-[#1C1C20] border-b border-[#27272A] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-white text-lg">Suggest something</h2>
                <p className="text-[#71717A] text-sm mt-0.5">Help us improve this website</p>
              </div>
              <button onClick={close} className="text-[#71717A] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {sent ? (
                <div className="py-8 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-white text-xl mb-2">Thanks for the idea!</h3>
                  <p className="text-[#A1A1AA] text-sm">We read every suggestion and use them to make the website better.</p>
                  <button onClick={close} className="mt-6 px-5 py-2.5 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white" htmlFor="wf-name">
                      Your Name <span className="text-[#71717A] font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      id="wf-name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Anonymous"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white" htmlFor="wf-category">
                      What kind of suggestion? <span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <select
                      id="wf-category"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white" htmlFor="wf-suggestion">
                      Your suggestion <span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <textarea
                      id="wf-suggestion"
                      required
                      rows={4}
                      value={form.suggestion}
                      onChange={(e) => setForm((p) => ({ ...p, suggestion: e.target.value }))}
                      placeholder="I'd love to see…"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending…" : "Send Suggestion"}
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
