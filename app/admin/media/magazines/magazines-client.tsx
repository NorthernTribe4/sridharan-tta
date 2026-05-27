"use client"

import { useState, useTransition } from "react"
import { Trash2, Plus, X, Download } from "lucide-react"
import { toast } from "sonner"
import { PhotoUpload } from "@/components/admin/photo-upload"
import { addMagazine, deleteMagazine } from "./actions"
import type { Magazine } from "@/lib/types"

function formatIssueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}

export function MagazinesAdminClient({ magazines: initial }: { magazines: Magazine[] }) {
  const [magazines, setMagazines] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!cover) { setError("Please add a cover image."); return }
    const fd = new FormData(e.currentTarget)
    fd.set("cover_image", cover)
    startTransition(async () => {
      const result = await addMagazine(fd)
      if (!result.ok) {
        setError(result.error ?? "Failed")
        toast.error(`Save failed: ${result.error}`)
        return
      }
      toast.success("Magazine saved")
      setShowForm(false)
      setCover(null)
      window.location.reload()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this magazine?")) return
    startTransition(async () => {
      const result = await deleteMagazine(id)
      if (result.ok) {
        setMagazines((m) => m.filter((x) => x.id !== id))
        toast.success("Magazine deleted")
      } else {
        toast.error(`Delete failed: ${result.error}`)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#71717A] text-sm">{magazines.length} issues</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors"
        >
          <Plus size={15} /> Add Issue
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-white">New Magazine Issue</h3>
            <button type="button" onClick={() => { setShowForm(false); setCover(null) }} className="text-[#71717A] hover:text-white"><X size={18} /></button>
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          <PhotoUpload value={cover} onChange={setCover} shape="square" outputSize={1000} />

          {[
            { name: "title", label: "Title", placeholder: "e.g. Sridharan TTA Magazine — Issue 3", required: true, type: "text" },
            { name: "pdf_url", label: "PDF URL", placeholder: "https://...", required: true, type: "text" },
            { name: "issue_date", label: "Issue Date", placeholder: "", required: true, type: "date" },
            { name: "description", label: "Description", placeholder: "Optional summary", required: false, type: "text" },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-white block mb-1">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
          ))}
          <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60">
            {isPending ? "Saving…" : "Save Issue"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {magazines.map((mag) => (
          <div key={mag.id} className="bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden lift">
            <div className="aspect-[3/4] relative bg-[#1C1C20]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mag.cover_image} alt={mag.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white text-sm font-semibold line-clamp-1 mb-0.5">{mag.title}</p>
              <p className="text-[#71717A] text-xs mb-3">{formatIssueDate(mag.issue_date)}</p>
              <div className="flex items-center justify-between">
                <a href={mag.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#F97316] hover:text-[#EA580C] transition-colors">
                  <Download size={12} /> PDF
                </a>
                <button onClick={() => handleDelete(mag.id)} className="text-[#71717A] hover:text-red-400 transition-colors" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
