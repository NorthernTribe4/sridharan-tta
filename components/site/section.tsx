import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  tight?: boolean
}

export function Section({ children, className, id, tight }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        tight ? "py-10 md:py-14" : "py-16 md:py-24",
        className
      )}
    >
      {children}
    </section>
  )
}
