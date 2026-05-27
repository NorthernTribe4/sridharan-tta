"use client"

import { useState, useTransition } from "react"
import { Plus, Edit3, Trash2, X, Save } from "lucide-react"
import { toast } from "sonner"
import { PhotoUpload } from "@/components/admin/photo-upload"
import { saveTeamMember, deleteTeamMember } from "./actions"
import type { TeamMember, TeamRole } from "@/lib/types"

const ROLES: { value: TeamRole; label: string }[] = [
  { value: "founder", label: "Founder" },
  { value: "coach", label: "Coach" },
  { value: "player", label: "Player" },
  { value: "manager", label: "Manager" },
]

const CATEGORIES = [
  { value: "senior", label: "Senior" },
  { value: "junior", label: "Junior" },
  { value: "youth", label: "Youth" },
  { value: "sub_youth", label: "Sub-Youth" },
]

const STYLES = [
  { value: "attacking", label: "Attacking" },
  { value: "all_round", label: "All-round" },
  { value: "defensive", label: "Defensive" },
  { value: "power", label: "Power" },
  { value: "spin", label: "Spin" },
]

type Draft = {
  id?: string
  full_name: string
  role: TeamRole
  bio: string
  achievements: string
  photo_url: string | null
  display_order: number
  short_label: string
  category: string
  playing_style: string
  age: string
  years_training: string
}

function emptyDraft(role: TeamRole = "player"): Draft {
  return {
    full_name: "",
    role,
    bio: "",
    achievements: "",
    photo_url: null,
    display_order: 0,
    short_label: "",
    category: "",
    playing_style: "",
    age: "",
    years_training: "",
  }
}

function memberToDraft(m: TeamMember): Draft {
  return {
    id: m.id,
    full_name: m.full_name,
    role: m.role,
    bio: m.bio,
    achievements: m.achievements.join("\n"),
    photo_url: m.photo_url,
    display_order: m.display_order,
    short_label: m.short_label ?? "",
    category: m.category ?? "",
    playing_style: m.playing_style ?? "",
    age: m.age?.toString() ?? "",
    years_training: m.years_training?.toString() ?? "",
  }
}

export function TeamAdminClient({ members: initial }: { members: TeamMember[] }) {
  const [members, setMembers] = useState(initial)
  const [activeRole, setActiveRole] = useState<TeamRole>("founder")
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = members.filter((m) => m.role === activeRole)

  function startNew() {
    setDraft(emptyDraft(activeRole))
    setError(null)
  }
  function startEdit(m: TeamMember) {
    setDraft(memberToDraft(m))
    setError(null)
  }
  function cancelEdit() {
    setDraft(null)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    setError(null)
    startTransition(async () => {
      const payload = {
        id: draft.id,
        full_name: draft.full_name,
        role: draft.role,
        bio: draft.bio,
        achievements: draft.achievements.split("\n").map((s) => s.trim()).filter(Boolean),
        photo_url: draft.photo_url,
        display_order: Number(draft.display_order) || 0,
        short_label: draft.short_label.trim() || null,
        category: (draft.category || null) as Draft["category"] extends "" ? null : "senior" | "junior" | "youth" | "sub_youth" | null,
        playing_style: (draft.playing_style || null) as Draft["playing_style"] extends "" ? null : "attacking" | "all_round" | "defensive" | "power" | "spin" | null,
        age: draft.age ? Number(draft.age) : null,
        years_training: draft.years_training ? Number(draft.years_training) : null,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await saveTeamMember(payload as any)
      if (!result.ok) {
        setError(result.error)
        toast.error(`Save failed: ${result.error}`)
        return
      }
      toast.success(draft.id ? "Updated team member" : "Added team member")
      window.location.reload()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this team member? This cannot be undone.")) return
    startTransition(async () => {
      const result = await deleteTeamMember(id)
      if (result.ok) {
        setMembers((arr) => arr.filter((m) => m.id !== id))
        toast.success("Deleted team member")
      } else {
        toast.error(`Delete failed: ${result.error}`)
      }
    })
  }

  return (
    <div>
      {/* Role tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ROLES.map((r) => {
          const count = members.filter((m) => m.role === r.value).length
          const active = activeRole === r.value
          return (
            <button
              key={r.value}
              onClick={() => { setActiveRole(r.value); setDraft(null) }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                active
                  ? "bg-[#F97316] border-[#F97316] text-black"
                  : "bg-[#141416] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white"
              }`}
            >
              {r.label}s <span className={active ? "text-black/60" : "text-[#52525B]"}>· {count}</span>
            </button>
          )
        })}
      </div>

      {/* Action row */}
      {!draft && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#71717A] text-sm">{filtered.length} {activeRole}{filtered.length === 1 ? "" : "s"}</p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors"
          >
            <Plus size={15} /> Add {ROLES.find((r) => r.value === activeRole)?.label}
          </button>
        </div>
      )}

      {/* Edit form */}
      {draft && (
        <form onSubmit={handleSubmit} className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-white text-lg">
              {draft.id ? "Edit" : "Add"} {ROLES.find((r) => r.value === draft.role)?.label}
            </h3>
            <button type="button" onClick={cancelEdit} className="text-[#71717A] hover:text-white"><X size={18} /></button>
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          <PhotoUpload value={draft.photo_url} onChange={(url) => setDraft({ ...draft, photo_url: url })} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white block mb-1">Full Name *</label>
              <input
                required
                value={draft.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white block mb-1">Role</label>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as TeamRole })}
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
              >
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white block mb-1">Bio</label>
            <textarea
              rows={3}
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              placeholder="Short description…"
              className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white block mb-1">Achievements <span className="text-[#71717A] font-normal text-xs">(one per line)</span></label>
            <textarea
              rows={3}
              value={draft.achievements}
              onChange={(e) => setDraft({ ...draft, achievements: e.target.value })}
              placeholder="District champion 2024&#10;State quarterfinalist"
              className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white block mb-1">Display Order</label>
              <input
                type="number"
                value={draft.display_order}
                onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white block mb-1">Short Label</label>
              <input
                value={draft.short_label}
                onChange={(e) => setDraft({ ...draft, short_label: e.target.value })}
                placeholder="e.g. Head Coach"
                className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white placeholder-[#52525B] text-sm outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
            {draft.role === "player" && (
              <div>
                <label className="text-sm font-medium text-white block mb-1">Age</label>
                <input
                  type="number"
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            )}
          </div>

          {draft.role === "player" && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-white block mb-1">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                >
                  <option value="">—</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-1">Playing Style</label>
                <select
                  value={draft.playing_style}
                  onChange={(e) => setDraft({ ...draft, playing_style: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                >
                  <option value="">—</option>
                  {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-1">Years Training</label>
                <input
                  type="number"
                  value={draft.years_training}
                  onChange={(e) => setDraft({ ...draft, years_training: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#1C1C20] text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-black font-semibold text-sm hover:bg-[#EA580C] transition-colors disabled:opacity-60">
              <Save size={14} />
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {!draft && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="text-[#71717A] text-sm col-span-full">No {activeRole}s yet.</p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="bg-[#141416] border border-[#27272A] rounded-2xl p-5 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1C1C20] border border-[#27272A] overflow-hidden shrink-0 flex items-center justify-center">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-bold text-lg text-[#F97316]">
                      {m.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-white text-sm truncate">{m.full_name}</p>
                  <p className="text-[#71717A] text-xs mb-2">
                    {m.short_label ?? ROLES.find((r) => r.value === m.role)?.label}
                    {m.category && ` · ${m.category}`}
                  </p>
                  <p className="text-[#A1A1AA] text-xs line-clamp-2 mb-3">{m.bio || "No bio yet."}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1C20] border border-[#27272A] text-white text-xs font-semibold hover:border-[#F97316]/50 transition-colors"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
