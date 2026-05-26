import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { createClient } from "@/lib/supabase/server"
import { Eyebrow } from "@/components/site/eyebrow"
import type { NewsArticle } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("news_articles")
      .select("title, excerpt")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
    if (data) {
      return { title: data.title, description: data.excerpt }
    }
  } catch { /* empty */ }
  return { title: "Article" }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  let article: NewsArticle | null = null

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("news_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
    article = data as NewsArticle | null
  } catch { /* empty */ }

  if (!article) notFound()

  return (
    <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/media/news" className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-white transition-colors mb-8">
          ← Back to News
        </Link>

        <Eyebrow>News</Eyebrow>

        <h1 className="text-section font-heading text-white mt-3 mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-[#71717A]">{formatDate(article.published_at)}</span>
          <span className="text-[#3F3F46]">·</span>
          <span className="text-sm text-[#71717A]">By {article.author}</span>
        </div>

        {article.featured_image && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-[#27272A]">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="prose-dark">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
