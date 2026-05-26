import type { Metadata } from "next"
import { Hero } from "@/components/home/hero"
import { AboutSection } from "@/components/home/about-section"
import { QuickLinksGrid } from "@/components/home/quick-links-grid"
import { FactsAndFigures } from "@/components/home/facts-and-figures"
import { FeaturedPlayers } from "@/components/home/featured-players"
import { LatestNews } from "@/components/home/latest-news"
import { ReviewsSection } from "@/components/home/reviews-section"
import { FindUs } from "@/components/home/find-us"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Sridharan Table Tennis Academy — world-class table tennis coaching for all ages in Chennai, Tamil Nadu.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <QuickLinksGrid />
      <FactsAndFigures />
      <FeaturedPlayers />
      <LatestNews />
      <ReviewsSection />
      <FindUs />
    </>
  )
}
