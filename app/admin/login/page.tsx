"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { Logo } from "@/components/site/logo"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/admin/scores"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-5"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--tta-navy)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[var(--tta-navy)]/20 focus:border-[var(--tta-navy)] transition-colors"
          placeholder="coach@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--tta-navy)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[var(--tta-navy)]/20 focus:border-[var(--tta-navy)] transition-colors"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--tta-navy)] text-white font-semibold text-sm hover:bg-[var(--tta-navy)]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[var(--tta-chalk)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-[var(--tta-navy)]" />
          <h1 className="font-heading font-extrabold text-2xl text-[var(--tta-navy)]">
            Coach Login
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to access score entry
          </p>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-white animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
