"use client"

import { useState } from "react"
import { X, Send, CheckCircle } from "lucide-react"
import { submitContact } from "@/app/actions/contact"

export function ContactModal() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })

  function close() {
    setOpen(false)
    setTimeout(() => {
      setSent(false)
      setError(null)
      setForm({ name: "", email: "", phone: "", message: "" })
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await submitContact(form)
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.error)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
      >
        Message us
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
                <h2 className="font-heading font-bold text-white text-lg">Message Us</h2>
                <p className="text-[#71717A] text-sm mt-0.5">We&apos;ll get back to you within 24 hours</p>
              </div>
              <button onClick={close} className="text-[#71717A] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {sent ? (
                <div className="py-8 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-white text-xl mb-2">Message Sent!</h3>
                  <p className="text-[#A1A1AA] text-sm">Thank you for reaching out. We&apos;ll be in touch soon.</p>
                  <button onClick={close} className="mt-6 px-5 py-2.5 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
                  )}
                  {[
                    { id: "cm-name", label: "Name", type: "text", required: true, key: "name", placeholder: "Your full name" },
                    { id: "cm-email", label: "Email", type: "email", required: true, key: "email", placeholder: "you@example.com" },
                    { id: "cm-phone", label: "Phone", type: "tel", required: false, key: "phone", placeholder: "+91 98765 43210" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-sm font-medium text-white" htmlFor={f.id}>
                        {f.label} {!f.required && <span className="text-[#71717A] font-normal text-xs">(optional)</span>}
                        {f.required && <span className="text-[#F97316] ml-0.5">*</span>}
                      </label>
                      <input
                        id={f.id}
                        type={f.type}
                        required={f.required}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white" htmlFor="cm-message">
                      Message <span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <textarea
                      id="cm-message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="How can we help you?"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending…" : <><Send size={15} /> Send Message</>}
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
