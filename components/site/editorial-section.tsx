import { cn } from "@/lib/utils"
import { Eyebrow } from "./eyebrow"

interface EditorialSectionProps {
  eyebrow?: string
  heading?: string
  intro?: string
  children: React.ReactNode
  className?: string
  id?: string
  dark?: boolean
}

export function EditorialSection({
  eyebrow,
  heading,
  intro,
  children,
  className,
  id,
  dark = false,
}: EditorialSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 px-4 sm:px-6 lg:px-8",
        dark ? "bg-[#141416]" : "bg-[#0A0A0B]",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {(eyebrow || heading || intro) && (
          <div className="mb-12">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading && (
              <h2 className="text-section font-heading text-white">{heading}</h2>
            )}
            {intro && (
              <p className="mt-4 text-[#A1A1AA] text-lg max-w-2xl">{intro}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
