"use client"

import { useState, useTransition } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { addVideo, deleteVideo } from "./actions"
import { youtubeThumbnail } from "@/lib/youtube"
import type { MediaVideo } from "@/lib/types"

export function VideosAdminClient({ videos: initial }: { videos: MediaVideo[] }) {
  const [videos, setVideos] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addVideo(fd)
      if (!result.ok) { setError(result.error ?? "Failed"); return }
      setShowForm(false)
      window.location.reload()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this video?")) return
    startTransition(async () => {
      const result = await deleteVideo(id)
      if (result.ok) setVideos((v) => v.filter((x) => x.id !== id))
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#71717A] text-sm">{videos.length} videos</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors"
        >
          <Plus size={15} /> Add Video
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-white">New Video</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#71717A] hover:text-white"><X size={18} /></button>
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
          {[
            { name: "title", label: "Title", placeholder: "Video title", required: true },
            { name: "video_url", label: "YouTube Embed URL", placeholder: "https://www.youtube.com/embed/...", required: true },
            { name: "thumbnail_url", label: "Custom Thumbnail URL", placeholder: "Leave blank to auto-generate from YouTube", required: false },
            { name: "description", label: "Description", placeholder: "Optional", required: false },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-white block mb-1">{f.label}</label>
              <input
                name={f.name}
                required={f.required}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
          ))}
          <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60">
            {isPending ? "Saving…" : "Save Video"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const thumb = video.thumbnail_url || youtubeThumbnail(video.video_url)
          return (
            <div key={video.id} className="bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden">
              <div className="aspect-video relative bg-[#1C1C20]">
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-white text-sm font-semibold line-clamp-1">{video.title}</p>
                  {video.description && <p className="text-[#71717A] text-xs line-clamp-1">{video.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="text-[#71717A] hover:text-red-400 transition-colors shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
