import Image from "next/image"

interface ImageWithCaptionProps {
  src: string
  alt: string
  caption: string
}

export function ImageWithCaption({ src, alt, caption }: ImageWithCaptionProps) {
  return (
    <div>
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <p className="text-sm text-[#A1A1AA] leading-relaxed">{caption}</p>
    </div>
  )
}
