"use client"

import Image from "next/image"
import { ContactModal } from "./contact-modal"
import { VideoModal } from "@/components/site/video-modal"
import { Play } from "lucide-react"

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1920"
        alt="Table tennis player in action"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.82) 100%)" }}
      />

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-4">
            Chennai · Since 2010
          </p>
          <h1 className="text-display font-heading text-white mb-6">
            Where Chennai&apos;s champions<br />
            <span className="text-[#F97316]">are made.</span>
          </h1>
          <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
            Premier table tennis training since 2010. Structured coaching for players aged 6 and above — from first grip to national stage.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <ContactModal />
            <VideoModal
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
              trigger={
                <button className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
                  <span className="w-7 h-7 rounded-full border border-black/20 flex items-center justify-center">
                    <Play size={12} fill="currentColor" />
                  </span>
                  Watch our story
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
