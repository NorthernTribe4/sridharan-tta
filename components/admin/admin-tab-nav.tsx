"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { label: "Score Entry", href: "/admin/scores" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Photos", href: "/admin/media/photos" },
  { label: "Videos", href: "/admin/media/videos" },
  { label: "News", href: "/admin/media/news" },
  { label: "Magazines", href: "/admin/media/magazines" },
]

export function AdminTabNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-white/10 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/")
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? "border-[#F97316] text-white"
                    : "border-transparent text-white/50 hover:text-white/80 hover:border-white/20"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
