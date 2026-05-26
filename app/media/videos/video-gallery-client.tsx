"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { VideoModal } from "@/components/site/video-modal"
import { youtubeThumbnail } from "@/lib/youtube"
import type { MediaVideo } from "@/lib/types"

export function VideoGalleryClient({ videos }: { videos: MediaVideo[] }) {
  if (videos.length === 0) {
    return <p className="text-[#71717A] text-sm">No videos yet.</p>
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {videos.map((video) => {
        const thumb = video.thumbnail_url || youtubeThumbnail(video.video_url)
        const trigger = (
          <div className="group block text-left bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] transition-colors cursor-pointer">
            <div className="relative aspect-video bg-[#1C1C20]">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={20} className="text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-white text-sm leading-snug mb-1 group-hover:text-[#F97316] transition-colors">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-[#71717A] text-xs leading-relaxed line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        )
        return (
          <VideoModal key={video.id} videoUrl={video.video_url} trigger={trigger} />
        )
      })}
    </div>
  )
}
