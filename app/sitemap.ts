import type { MetadataRoute } from "next"

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sridharantta.example.com"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/matches`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ]
}
