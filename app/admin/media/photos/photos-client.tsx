"use client"

import { useState, useTransition } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { PhotoUpload } from "@/components/admin/photo-upload"
import { addPhoto, deletePhoto } from "./actions"
import type { MediaPhoto } from "@/lib/types"

const CATEGORIES = ["training", "matches", "events", "facilities"]

export function PhotosAdminClient({ photos: initial }: { photos: MediaPhoto[] }) {
  const [photos, setPhotos] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!photoUrl) {
      setError("Please add a photo before saving.")
      return
    }
    const fd = new FormData(e.currentTarget)
    fd.set("photo_url", photoUrl)
    startTransition(async () => {
      const result = await addPhoto(fd)
      if (!result.ok) {
        setError(result.error ?? "Failed")
        toast.error(`Save failed: ${result.error}`)
        return
      }
      toast.success("Photo added")
      setShowForm(false)
      setPhotoUrl(null)
      window.location.reload()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return
    startTransition(async () => {
      const result = await deletePhoto(id)
      if (result.ok) {
        setPhotos((p) => p.filter((x) => x.id !== id))
        toast.success("Photo deleted")
      } else {
        toast.error(`Delete failed: ${result.error}`)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#71717A] text-sm">{photos.length} photos</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors"
        >
          <Plus size={15} /> Add Photo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-white">New Photo</h3>
            <button type="button" onClick={() => { setShowForm(false); setPhotoUrl(null) }} className="text-[#71717A] hover:text-white"><X size={18} /></button>
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} shape="square" outputSize={1200} />

          <div>
            <label className="text-sm font-medium text-white block mb-1">Title</label>
            <input name="title" required placeholder="Photo title" className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block mb-1">Description</label>
            <input name="description" placeholder="Optional caption" className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block mb-1">Category</label>
            <select name="category" required className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors">
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60">
            {isPending ? "Saving…" : "Save Photo"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden lift">
            <div className="aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.photo_url} alt={photo.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-white text-sm font-semibold line-clamp-1">{photo.title}</p>
                <p className="text-[#71717A] text-xs capitalize">{photo.category}</p>
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                className="text-[#71717A] hover:text-red-400 transition-colors shrink-0"
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
