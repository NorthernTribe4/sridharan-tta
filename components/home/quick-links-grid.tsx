import { Eyebrow } from "@/components/site/eyebrow"
import { QuickLinkCard } from "@/components/site/quick-link-card"
import { ProgramsModal } from "./programs-modal"

const links = [
  {
    title: "Our Coaches",
    href: "/team",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
  },
  {
    title: "Training Programmes",
    href: null,
    image: "https://images.unsplash.com/photo-1609710728851-30a82a8de9fe?w=800",
    modal: true,
  },
  {
    title: "Facts & Figures",
    href: "#stats",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  },
  {
    title: "Testimonials",
    href: "#testimonials",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
  },
  {
    title: "Visit Us",
    href: "#find-us",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
  },
  {
    title: "Latest News",
    href: "/media/news",
    image: "https://images.unsplash.com/photo-1611251135345-18c56206b863?w=800",
  },
]

export function QuickLinksGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto">
        <Eyebrow>Explore</Eyebrow>
        <h2 className="text-section font-heading text-white mb-10">Explore the academy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {links.map((l) =>
            l.modal ? (
              <ProgramsModal
                key={l.title}
                trigger={
                  <QuickLinkCard
                    title={l.title}
                    imageSrc={l.image}
                  />
                }
              />
            ) : (
              <QuickLinkCard
                key={l.title}
                title={l.title}
                href={l.href ?? undefined}
                imageSrc={l.image}
              />
            )
          )}
        </div>
      </div>
    </section>
  )
}
