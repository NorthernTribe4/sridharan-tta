import { Eyebrow } from "@/components/site/eyebrow"
import { ImageWithCaption } from "@/components/site/image-with-caption"

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#141416]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
          {/* Text */}
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 className="text-section font-heading text-white mb-6">
              About Sridharan Academy
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg leading-relaxed mb-5">
              Founded in 2010 by Sridharan Murugan — a former state-level competitor with a passion for developing talent — the academy began with a single training hall and a clear mission: to give every player in Chennai access to world-class coaching, regardless of their background or experience level.
            </p>
            <p className="text-[#A1A1AA] text-base md:text-lg leading-relaxed">
              Today, Sridharan Table Tennis Academy is one of Tamil Nadu&apos;s most respected training environments. Our community spans sub-youth players picking up a bat for the first time to seniors competing at national level. We believe that sport builds not just skill but character — and that every hour on the table teaches something that lasts a lifetime.
            </p>
          </div>

          {/* Embedded video */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-[#27272A]">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Sridharan TTA — Our story"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Two image-caption blocks */}
        <div className="grid sm:grid-cols-2 gap-8">
          <ImageWithCaption
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900"
            alt="Training hall with table tennis tables"
            caption="World-class facilities in the heart of Chennai. Six international-spec tables, dedicated training halls, and modern equipment."
          />
          <ImageWithCaption
            src="https://images.unsplash.com/photo-1611251135345-18c56206b863?w=900"
            alt="Students playing table tennis"
            caption="Our graduates have competed at district, state, and national levels — and gone on to careers in sport, education, and beyond."
          />
        </div>
      </div>
    </section>
  )
}
