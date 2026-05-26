export function extractYouTubeId(embedUrl: string): string | null {
  const match = embedUrl.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match ? (match[1] ?? null) : null
}

export function youtubeThumbnail(embedUrl: string): string {
  const id = extractYouTubeId(embedUrl)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ""
}
