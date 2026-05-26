"use client"

import { useState, useTransition } from "react"
import { Trash2, Plus, X, Eye, EyeOff } from "lucide-react"
import { addArticle, togglePublish, deleteArticle } from "./actions"
import type { NewsArticle } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function NewsAdminClient({ articles: initial }: { articles: NewsArticle[] }) {
  const [articles, setArticles] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addArticle(fd)
      if (!result.ok) { setError(result.error ?? "Failed"); return }
      setShowForm(false)
      window.location.reload()
    })
  }

  async function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePublish(id, current)
      if (result.ok) {
        setArticles((a) => a.map((x) => x.id === id ? { ...x, is_published: !current } : x))
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return
    startTransition(async () => {
      const result = await deleteArticle(id)
      if (result.ok) setArticles((a) => a.filter((x) => x.id !== id))
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#71717A] text-sm">{articles.length} articles</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors"
        >
          <Plus size={15} /> New Article
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-white">New Article</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#71717A] hover:text-white"><X size={18} /></button>
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
          {[
            { name: "title", label: "Title", placeholder: "Article title", required: true, textarea: false },
            { name: "author", label: "Author", placeholder: "Author name", required: true, textarea: false },
            { name: "featured_image", label: "Featured Image URL", placeholder: "https://... (optional)", required: false, textarea: false },
            { name: "excerpt", label: "Excerpt", placeholder: "One sentence summary…", required: true, textarea: true },
            { name: "content", label: "Content (Markdown)", placeholder: "Full article in Markdown…", required: true, textarea: true },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-white block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea
                  name={f.name}
                  required={f.required}
                  placeholder={f.placeholder}
                  rows={f.name === "content" ? 8 : 3}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors resize-none"
                />
              ) : (
                <input
                  name={f.name}
                  required={f.required}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-white">Publish immediately</label>
            <select name="is_published" className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors">
              <option value="true">Yes</option>
              <option value="false">No (draft)</option>
            </select>
          </div>
          <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60">
            {isPending ? "Saving…" : "Save Article"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="bg-[#141416] border border-[#27272A] rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${article.is_published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#27272A] text-[#71717A]"}`}>
                  {article.is_published ? "Published" : "Draft"}
                </span>
                <span className="text-xs text-[#52525B]">{formatDate(article.published_at)}</span>
              </div>
              <p className="text-white font-semibold text-sm line-clamp-1">{article.title}</p>
              <p className="text-[#71717A] text-xs">By {article.author}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(article.id, article.is_published)}
                disabled={isPending}
                className="text-[#71717A] hover:text-white transition-colors"
                aria-label={article.is_published ? "Unpublish" : "Publish"}
              >
                {article.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={() => handleDelete(article.id)}
                disabled={isPending}
                className="text-[#71717A] hover:text-red-400 transition-colors"
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
