"use client"

import { useState } from "react"
import Image from "next/image"
import { Pill } from "@/components/site/pill"
import { LightboxModal } from "@/components/site/lightbox-modal"
import type { MediaPhoto } from "@/lib/types"

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "training", label: "Training" },
  { value: "matches", label: "Matches" },
  { value: "events", label: "Events" },
  { value: "facilities", label: "Facilities" },
]

export function PhotoGalleryClient({ photos }: { photos: MediaPhoto[] }) {
  const [active, setActive] = useState("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = active === "all" ? photos : photos.filter((p) => p.category === active)
  const lightboxImages = filtered.map((p) => ({ src: p.photo_url, title: p.title, description: p.description }))

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <Pill key={c.value} active={active === c.value} onClick={() => setActive(c.value)}>
            {c.label}
          </Pill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#71717A] text-sm">No photos in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[#27272A] hover:border-[#F97316]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
            >
              <Image
                src={photo.photo_url}
                alt={photo.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-semibold line-clamp-2 text-left">{photo.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <LightboxModal
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
