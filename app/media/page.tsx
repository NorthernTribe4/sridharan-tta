import type { Metadata } from "next"
import Link from "next/link"
import { Camera, Video, Newspaper, BookOpen } from "lucide-react"
import { Eyebrow } from "@/components/site/eyebrow"

export const metadata: Metadata = {
  title: "Media",
  description: "Photos, videos, news, and magazines from Sridharan Table Tennis Academy.",
}

const tiles = [
  {
    href: "/media/photos",
    icon: Camera,
    title: "Photo Gallery",
    description: "Training moments, match action, events, and facilities captured in photos.",
    color: "text-[#F97316]",
    bg: "bg-[#F97316]/10",
    border: "border-[#F97316]/20",
  },
  {
    href: "/media/videos",
    icon: Video,
    title: "Video Gallery",
    description: "Match highlights, coaching drills, and championship moments on video.",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    border: "border-[#3B82F6]/20",
  },
  {
    href: "/media/news",
    icon: Newspaper,
    title: "News",
    description: "Latest updates, achievements, and announcements from the academy.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    href: "/media/magazines",
    icon: BookOpen,
    title: "Magazines",
    description: "Digital editions of our academy magazine — download or read online.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
]

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <Eyebrow>Media</Eyebrow>
          <h1 className="text-display font-heading text-white mb-4">Media Centre</h1>
          <p className="text-[#A1A1AA] text-lg max-w-xl">
            Photos, videos, news, and publications from Sridharan TTA — the full story in every format.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className="group block bg-[#141416] border border-[#27272A] rounded-2xl p-8 hover:border-[#3F3F46] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl ${tile.bg} border ${tile.border} flex items-center justify-center mb-6`}>
                  <Icon size={22} className={tile.color} />
                </div>
                <h2 className="font-heading font-bold text-white text-xl mb-2 group-hover:text-[#F97316] transition-colors">
                  {tile.title}
                </h2>
                <p className="text-[#71717A] text-sm leading-relaxed">{tile.description}</p>
                <span className={`inline-block mt-4 text-sm font-semibold ${tile.color}`}>
                  Browse →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
