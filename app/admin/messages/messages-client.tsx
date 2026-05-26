"use client"

import { useState, useTransition } from "react"
import { Mail, MailOpen, Phone } from "lucide-react"
import { markMessageRead } from "@/app/admin/reviews/actions"
import type { ContactMessage } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MessagesClient({ messages: initial }: { messages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initial)
  const [pending, startTransition] = useTransition()

  function handleMarkRead(id: string) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m))
    startTransition(async () => {
      await markMessageRead(id)
    })
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-2xl border p-5 transition-colors ${
            msg.is_read
              ? "bg-white border-border"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`mt-0.5 shrink-0 ${msg.is_read ? "text-muted-foreground" : "text-blue-500"}`}>
                {msg.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[var(--tta-navy)] text-sm">{msg.name}</p>
                  {!msg.is_read && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <a href={`mailto:${msg.email}`} className="hover:text-[var(--tta-navy)] transition-colors">
                    {msg.email}
                  </a>
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={11} />
                      {msg.phone}
                    </span>
                  )}
                  <span>{formatDate(msg.created_at)}</span>
                </div>
              </div>
            </div>

            {!msg.is_read && (
              <button
                onClick={() => handleMarkRead(msg.id)}
                disabled={pending}
                className="shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
              >
                Mark read
              </button>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-700 leading-relaxed pl-7 whitespace-pre-wrap">
            {msg.message}
          </p>
        </div>
      ))}
    </div>
  )
}
