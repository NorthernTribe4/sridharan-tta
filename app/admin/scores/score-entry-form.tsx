"use client"

import { useEffect, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlayerCombobox } from "./player-combobox"
import { scoreSchema, type ScoreFormValues } from "./schema"
import { submitMatch } from "./actions"
import { isValidSetScore, matchWinnerFromSets, threshold } from "@/lib/tt-rules"
import { today } from "@/lib/utils"
import type { TeamMember } from "@/lib/types"

const DRAFT_KEY = "tta-score-draft"

export function ScoreEntryForm({ players }: { players: TeamMember[] }) {
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      match_date: today(),
      player1_id: "",
      player2_id: "",
      best_of: 3,
      // NaN renders as empty in the input but still satisfies the schema's type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sets: [{ player1_score: NaN as any, player2_score: NaN as any }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sets",
  })

  const watchedValues = form.watch()

  // Restore draft — but only prompt if the draft has real, meaningful data
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as ScoreFormValues
      const hasPlayers = !!(draft.player1_id || draft.player2_id)
      const hasScore = (draft.sets ?? []).some(
        (s) => Number.isFinite(s?.player1_score) || Number.isFinite(s?.player2_score)
      )
      if (!hasPlayers && !hasScore) {
        // Empty / default draft — silently discard, no prompt
        sessionStorage.removeItem(DRAFT_KEY)
        return
      }
      const restore = window.confirm("Restore your previous draft?")
      if (restore) form.reset(draft)
      else sessionStorage.removeItem(DRAFT_KEY)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist draft on change
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues))
    } catch {}
  }, [watchedValues])

  // Live winner preview
  const liveWinner = (() => {
    const { player1_id, player2_id, best_of, sets } = watchedValues
    if (!player1_id || !player2_id) return null
    return matchWinnerFromSets(sets, player1_id, player2_id, Number(best_of))
  })()

  const winnerName = liveWinner
    ? players.find((p) => p.id === liveWinner)?.full_name ?? "Unknown"
    : null

  const setsWon = (() => {
    let p1 = 0; let p2 = 0
    for (const s of watchedValues.sets) {
      if (isValidSetScore(s.player1_score, s.player2_score)) {
        if (s.player1_score > s.player2_score) p1++
        else p2++
      }
    }
    return { p1, p2 }
  })()

  const matchDecided = liveWinner !== null
  const t = threshold(Number(watchedValues.best_of))

  const canAddSet =
    !matchDecided && fields.length < Number(watchedValues.best_of)

  const onSubmit = useCallback(async (values: ScoreFormValues) => {
    const result = await submitMatch(values as Parameters<typeof submitMatch>[0])
    if (result.ok) {
      toast.success(`Match saved! Winner: ${result.winnerName}`)
      sessionStorage.removeItem(DRAFT_KEY)
      form.reset({
        match_date: today(),
        player1_id: "",
        player2_id: "",
        best_of: 3,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sets: [{ player1_score: NaN as any, player2_score: NaN as any }],
      })
    } else {
      toast.error(result.error)
    }
  }, [form])

  const p1Name = players.find((p) => p.id === watchedValues.player1_id)?.full_name ?? "Player 1"
  const p2Name = players.find((p) => p.id === watchedValues.player2_id)?.full_name ?? "Player 2"

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Match details */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
        <h2 className="font-heading font-bold text-[var(--tta-navy)] text-lg">Match Details</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--tta-navy)]">Match Date</label>
            <input
              type="date"
              {...form.register("match_date")}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[var(--tta-navy)]/20 focus:border-[var(--tta-navy)] transition-colors"
            />
            {form.formState.errors.match_date && (
              <p className="text-xs text-red-500">{form.formState.errors.match_date.message}</p>
            )}
          </div>

          {/* Best of */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--tta-navy)]">Format</label>
            <Controller
              control={form.control}
              name="best_of"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) as 3 | 5 | 7)
                    // Reset sets when format changes
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    form.setValue("sets", [{ player1_score: NaN as any, player2_score: NaN as any }])
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[var(--tta-navy)]/20 focus:border-[var(--tta-navy)] transition-colors"
                >
                  <option value={3}>Best of 3 (first to 2 sets)</option>
                  <option value={5}>Best of 5 (first to 3 sets)</option>
                  <option value={7}>Best of 7 (first to 4 sets)</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Players */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--tta-navy)]">Player 1</label>
            <Controller
              control={form.control}
              name="player1_id"
              render={({ field }) => (
                <PlayerCombobox
                  players={players}
                  value={field.value}
                  onChange={field.onChange}
                  excludeId={watchedValues.player2_id}
                  placeholder="Select Player 1…"
                />
              )}
            />
            {form.formState.errors.player1_id && (
              <p className="text-xs text-red-500">{form.formState.errors.player1_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--tta-navy)]">Player 2</label>
            <Controller
              control={form.control}
              name="player2_id"
              render={({ field }) => (
                <PlayerCombobox
                  players={players}
                  value={field.value}
                  onChange={field.onChange}
                  excludeId={watchedValues.player1_id}
                  placeholder="Select Player 2…"
                />
              )}
            />
            {form.formState.errors.player2_id && (
              <p className="text-xs text-red-500">{form.formState.errors.player2_id.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sets */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-[var(--tta-navy)] text-lg">
            Set Scores
          </h2>
          {watchedValues.player1_id && watchedValues.player2_id && (
            <div className="text-sm text-muted-foreground font-mono tabular-nums">
              <span className="text-[var(--tta-navy)] font-semibold">{setsWon.p1}</span>
              {" – "}
              <span className="text-[var(--tta-navy)] font-semibold">{setsWon.p2}</span>
              <span className="ml-2 text-xs">(sets)</span>
            </div>
          )}
        </div>

        {/* Column headers */}
        {watchedValues.player1_id && watchedValues.player2_id && (
          <div className="grid grid-cols-[2rem_1fr_1.5rem_1fr_2rem] gap-2 items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            <span>#</span>
            <span>{p1Name}</span>
            <span />
            <span>{p2Name}</span>
            <span />
          </div>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const p1Raw = watchedValues.sets[index]?.player1_score
            const p2Raw = watchedValues.sets[index]?.player2_score
            const p1s = Number.isFinite(p1Raw) ? (p1Raw as number) : 0
            const p2s = Number.isFinite(p2Raw) ? (p2Raw as number) : 0
            const valid = isValidSetScore(p1s, p2s)
            const setWinner = valid ? (p1s > p2s ? 1 : 2) : null

            // Disable if match is already decided before this set
            const prevSets = watchedValues.sets.slice(0, index)
            const prevWinner = matchWinnerFromSets(
              prevSets,
              watchedValues.player1_id,
              watchedValues.player2_id,
              Number(watchedValues.best_of)
            )
            const isDisabled = !!prevWinner

            return (
              <div
                key={field.id}
                className={`grid grid-cols-[2rem_1fr_1.5rem_1fr_2rem] gap-2 items-center ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}
              >
                <span className="text-sm text-muted-foreground text-center font-mono">
                  {index + 1}
                </span>

                <Controller
                  control={form.control}
                  name={`sets.${index}.player1_score`}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={0}
                      max={11}
                      placeholder="0"
                      disabled={isDisabled}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === "") { field.onChange(NaN); return }
                        let n = Math.max(0, Math.min(11, parseInt(v, 10)))
                        if (Number.isNaN(n)) n = NaN
                        field.onChange(n)
                      }}
                      onBlur={field.onBlur}
                      onKeyDown={(e) => {
                        // Allow control keys; block non-digit characters (e, E, +, -, ., etc.)
                        if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"].includes(e.key)) return
                        if (!/^[0-9]$/.test(e.key)) e.preventDefault()
                      }}
                      onPaste={(e) => {
                        const txt = e.clipboardData.getData("text")
                        if (!/^\d+$/.test(txt)) e.preventDefault()
                      }}
                      className={`w-full text-center text-2xl font-bold tabular-nums px-3 py-3 rounded-xl border-2 outline-none transition-colors text-zinc-900 placeholder-zinc-300
                        ${setWinner === 1 ? "border-[#F97316] bg-[#F97316]/10" : "border-zinc-300 focus:border-[var(--tta-navy)]"}`}
                    />
                  )}
                />

                <span className="text-center text-muted-foreground font-bold">–</span>

                <Controller
                  control={form.control}
                  name={`sets.${index}.player2_score`}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={0}
                      max={11}
                      placeholder="0"
                      disabled={isDisabled}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === "") { field.onChange(NaN); return }
                        let n = Math.max(0, Math.min(11, parseInt(v, 10)))
                        if (Number.isNaN(n)) n = NaN
                        field.onChange(n)
                      }}
                      onBlur={field.onBlur}
                      onKeyDown={(e) => {
                        // Allow control keys; block non-digit characters (e, E, +, -, ., etc.)
                        if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"].includes(e.key)) return
                        if (!/^[0-9]$/.test(e.key)) e.preventDefault()
                      }}
                      onPaste={(e) => {
                        const txt = e.clipboardData.getData("text")
                        if (!/^\d+$/.test(txt)) e.preventDefault()
                      }}
                      className={`w-full text-center text-2xl font-bold tabular-nums px-3 py-3 rounded-xl border-2 outline-none transition-colors text-zinc-900 placeholder-zinc-300
                        ${setWinner === 2 ? "border-[#F97316] bg-[#F97316]/10" : "border-zinc-300 focus:border-[var(--tta-navy)]"}`}
                    />
                  )}
                />

                {fields.length > 1 && !isDisabled ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label="Remove set"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            )
          })}
        </div>

        {canAddSet && (
          <button
            type="button"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => append({ player1_score: NaN as any, player2_score: NaN as any })}
            className="flex items-center gap-1.5 text-sm text-[var(--tta-navy)] hover:text-[var(--tta-red)] font-medium transition-colors"
          >
            <Plus size={16} />
            Add Set {fields.length + 1}
          </button>
        )}

        {/* Winner preview */}
        {winnerName && (
          <div className="flex items-center gap-2 bg-[var(--tta-red)]/8 border border-[var(--tta-red)]/20 rounded-xl px-4 py-3 mt-2">
            <Trophy size={16} className="text-[var(--tta-red)] shrink-0" />
            <p className="text-sm font-semibold text-[var(--tta-red)]">
              Winner: {winnerName}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 z-10">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-14 rounded-2xl bg-[var(--tta-navy)] hover:bg-[var(--tta-navy)]/90 text-white font-heading font-bold text-base shadow-lg disabled:opacity-50"
        >
          {form.formState.isSubmitting ? "Saving…" : matchDecided ? `Save Match Result — Winner: ${winnerName}` : "Save Match Result"}
        </Button>
        {!matchDecided && watchedValues.player1_id && watchedValues.player2_id && (
          <p className="text-center text-xs text-amber-600 mt-2 font-medium">
            ⚠ Match not yet decided — need {t} sets to win. The server will reject this if the result isn&apos;t valid.
          </p>
        )}
      </div>
    </form>
  )
}
