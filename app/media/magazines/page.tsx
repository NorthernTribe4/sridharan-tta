import type { Metadata } from "next"
import Image from "next/image"
import { Download, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import type { Magazine } from "@/lib/types"

export const metadata: Metadata = {
  title: "Magazines",
  description: "Digital editions of the Sridharan TTA academy magazine.",
}

function formatIssueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}

export default async function MagazinesPage() {
  let magazines: Magazine[] = []
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("magazines")
      .select("*")
      .order("issue_date", { ascending: false })
    magazines = (data as Magazine[] | null) ?? []
  } catch {
    magazines = []
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Eyebrow>Media</Eyebrow>
          <h1 className="text-section font-heading text-white mb-2">Magazines</h1>
          <p className="text-[#A1A1AA] text-sm">Digital editions of the Sridharan TTA magazine</p>
        </div>

        {magazines.length === 0 ? (
          <p className="text-[#71717A]">No magazines published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {magazines.map((mag) => (
              <div
                key={mag.id}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] transition-colors group"
              >
                <div className="relative aspect-[3/4] bg-[#1C1C20]">
                  <Image
                    src={mag.cover_image}
                    alt={mag.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={14} className="text-[#F97316]" />
                    <span className="text-xs text-[#71717A]">{formatIssueDate(mag.issue_date)}</span>
                  </div>
                  <h2 className="font-heading font-bold text-white text-sm leading-snug mb-1">{mag.title}</h2>
                  {mag.description && (
                    <p className="text-[#71717A] text-xs leading-relaxed line-clamp-2 mb-4">{mag.description}</p>
                  )}
                  <a
                    href={mag.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors"
                  >
                    <Download size={13} />
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
