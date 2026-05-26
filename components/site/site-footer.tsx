import Link from "next/link"
import { MapPin, Mail } from "lucide-react"

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Coaches & Staff" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
]

const mediaLinks = [
  { href: "/media/photos", label: "Photo Gallery" },
  { href: "/media/videos", label: "Video Gallery" },
  { href: "/media/news", label: "News" },
  { href: "/media/magazines", label: "Magazines" },
]

export function SiteFooter() {
  return (
    <footer className="bg-[#0A0A0B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading font-black text-white text-xl tracking-tight">
                Sridharan<span className="text-[#F97316]"> TTA</span>
              </span>
            </Link>
            <p className="text-[#71717A] text-sm leading-relaxed">
              Building champions on and off the table. World-class coaching for all ages in the heart of Chennai.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-[#F97316] hover:border-[#F97316]/30 transition-colors">
                <IconInstagram />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-[#F97316] hover:border-[#F97316]/30 transition-colors">
                <IconFacebook />
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-[#F97316] hover:border-[#F97316]/30 transition-colors">
                <IconYoutube />
              </a>
            </div>
          </div>

          {/* Site links */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-5">Site</h3>
            <ul className="space-y-3">
              {siteLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#71717A] text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media links */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-5">Media</h3>
            <ul className="space-y-3">
              {mediaLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#71717A] text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#F97316] mt-0.5 shrink-0" />
                <span className="text-[#71717A] text-sm leading-relaxed">
                  Sridharan Table Tennis Academy<br />
                  Chennai, Tamil Nadu 600001<br />
                  India
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#F97316] mt-0.5 shrink-0" />
                <a href="mailto:info@srittacademy.com" className="text-[#71717A] text-sm hover:text-white transition-colors">
                  info@srittacademy.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#27272A] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#52525B]">
            © {new Date().getFullYear()} Sridharan Table Tennis Academy. All rights reserved.
          </p>
          <Link href="/admin/login" className="text-xs text-[#3F3F46] hover:text-[#71717A] transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
