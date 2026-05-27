"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

const ourPeopleLinks = [
  { href: "/team#founders", label: "Founders" },
  { href: "/team", label: "Coaches & Staff" },
  { href: "/players", label: "Players" },
]

const mediaLinks = [
  { href: "/media/photos", label: "Photo Gallery" },
  { href: "/media/videos", label: "Video Gallery" },
  { href: "/media/news", label: "News" },
  { href: "/media/magazines", label: "Magazines" },
]

const topLinks = [
  { href: "/matches", label: "Matches" },
  { href: "/admin/login", label: "Admin Login" },
]

function DropdownMenu({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-[#27272A] bg-[#141416] shadow-2xl py-1 z-50">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="block px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#1C1C20] transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [ourPeopleExpanded, setOurPeopleExpanded] = useState(false)
  const [mediaExpanded, setMediaExpanded] = useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Logo className="text-white" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "text-[#F97316]"
                  : "text-[#A1A1AA] hover:text-white"
              )}
            >
              Home
            </Link>

            {/* Our People dropdown */}
            <div className="relative group">
              <button className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
                (isActive("/team") || isActive("/players"))
                  ? "text-[#F97316]"
                  : "text-[#A1A1AA] hover:text-white"
              )}>
                Our People <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150">
                <DropdownMenu links={ourPeopleLinks} />
              </div>
            </div>

            {/* Media dropdown */}
            <div className="relative group">
              <button className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
                isActive("/media")
                  ? "text-[#F97316]"
                  : "text-[#A1A1AA] hover:text-white"
              )}>
                Media <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150">
                <DropdownMenu links={mediaLinks} />
              </div>
            </div>

            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  isActive(link.href) ? "text-[#F97316]" : "text-[#A1A1AA] hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#141416] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — full-screen slide-in */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0A0A0B] z-40 overflow-y-auto">
          <nav className="px-4 py-6 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-[#141416] transition-colors"
            >
              Home
            </Link>

            {/* Our People section */}
            <div>
              <button
                onClick={() => setOurPeopleExpanded(!ourPeopleExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-[#141416] transition-colors"
              >
                Our People
                <ChevronDown size={16} className={cn("transition-transform", ourPeopleExpanded && "rotate-180")} />
              </button>
              {ourPeopleExpanded && (
                <div className="ml-4 space-y-1 mt-1">
                  {ourPeopleLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-[#141416] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Media section */}
            <div>
              <button
                onClick={() => setMediaExpanded(!mediaExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-[#141416] transition-colors"
              >
                Media
                <ChevronDown size={16} className={cn("transition-transform", mediaExpanded && "rotate-180")} />
              </button>
              {mediaExpanded && (
                <div className="ml-4 space-y-1 mt-1">
                  {mediaLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-[#141416] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-[#A1A1AA] hover:text-white hover:bg-[#141416] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
