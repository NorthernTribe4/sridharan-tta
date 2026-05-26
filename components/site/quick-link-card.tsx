import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

interface QuickLinkCardProps {
  title: string
  href?: string
  imageSrc: string
  onClick?: () => void
}

export function QuickLinkCard({ title, href, imageSrc, onClick }: QuickLinkCardProps) {
  const inner = (
    <div className="relative group overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer">
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <h3 className="font-heading font-bold text-white text-lg leading-tight">{title}</h3>
        <ArrowRight
          size={20}
          className="text-[#F97316] shrink-0 translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
        />
      </div>
    </div>
  )

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{inner}</button>
  }

  return href ? <Link href={href}>{inner}</Link> : inner
}
