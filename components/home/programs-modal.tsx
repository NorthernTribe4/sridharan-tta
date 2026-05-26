"use client"

import { useState } from "react"
import { X } from "lucide-react"

const programs = [
  {
    name: "Foundation (Ages 6–10)",
    desc: "Introduction to the game — grip, stance, basic strokes, and game sense. Fun-first, technique-grounded.",
  },
  {
    name: "Development (Ages 10–14)",
    desc: "Structured skill-building. Footwork patterns, serve techniques, match-play strategies, and tournament preparation.",
  },
  {
    name: "Junior Advanced (U-19)",
    desc: "Competition-focused training for players targeting state and national rankings. High-volume multi-ball and tactical sessions.",
  },
  {
    name: "Senior Open",
    desc: "For adult players of all levels. Evening batches available. Individual assessment and personalised development plans.",
  },
  {
    name: "Elite Performance",
    desc: "Invitation-only programme for top-ranked players preparing for national and international competition.",
  },
]

interface ProgramsModalProps {
  trigger: React.ReactNode
}

export function ProgramsModal({ trigger }: ProgramsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer w-full">
        {trigger}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#27272A]">
              <h2 className="font-heading font-bold text-white text-lg">Training Programmes</h2>
              <button onClick={() => setOpen(false)} className="text-[#71717A] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {programs.map((p) => (
                <div key={p.name} className="bg-[#1C1C20] rounded-xl p-4 border border-[#27272A]">
                  <h3 className="font-heading font-semibold text-white text-sm mb-1">{p.name}</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
              <p className="text-xs text-[#71717A] pt-2">
                Contact us to discuss the right programme for your child or for yourself.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
