import Link from "next/link"
import Image from "next/image"
import { Eyebrow } from "@/components/site/eyebrow"
import { createClient } from "@/lib/supabase/server"
import type { NewsArticle } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export async function LatestNews() {
  let articles: NewsArticle[] = []
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("news_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)
    articles = (data as NewsArticle[] | null) ?? []
  } catch {
    articles = []
  }

  if (articles.length === 0) return null

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#141416]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Eyebrow>News</Eyebrow>
            <h2 className="text-section font-heading text-white">Latest news</h2>
          </div>
          <Link
            href="/media/news"
            className="hidden sm:inline-flex text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors"
          >
            All news →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/media/news/${article.slug}`}
              className="group block bg-[#1C1C20] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] transition-colors"
            >
              {article.featured_image && (
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-xs text-[#71717A] mb-2">{formatDate(article.published_at)}</p>
                <h3 className="font-heading font-bold text-white text-sm leading-snug mb-2 group-hover:text-[#F97316] transition-colors">
                  {article.title}
                </h3>
                <p className="text-[#A1A1AA] text-xs leading-relaxed line-clamp-2">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/media/news" className="text-sm font-semibold text-[#F97316]">
            All news →
          </Link>
        </div>
      </div>
    </section>
  )
}
