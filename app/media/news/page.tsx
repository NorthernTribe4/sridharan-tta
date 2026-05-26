import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import type { NewsArticle } from "@/lib/types"

export const metadata: Metadata = {
  title: "News",
  description: "Latest news, achievements, and announcements from Sridharan Table Tennis Academy.",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

export default async function NewsPage() {
  let articles: NewsArticle[] = []
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("news_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
    articles = (data as NewsArticle[] | null) ?? []
  } catch {
    articles = []
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Eyebrow>Media</Eyebrow>
          <h1 className="text-section font-heading text-white">News</h1>
        </div>

        {articles.length === 0 ? (
          <p className="text-[#71717A]">No articles published yet.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/media/news/${article.slug}`}
                className="group flex gap-5 bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] transition-colors"
              >
                {article.featured_image && (
                  <div className="relative w-36 sm:w-48 shrink-0 aspect-square sm:aspect-video">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 144px, 192px"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center py-5 pr-5">
                  <p className="text-xs text-[#71717A] mb-2">{formatDate(article.published_at)}</p>
                  <h2 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-[#F97316] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                  <span className="mt-3 text-xs font-semibold text-[#F97316]">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
