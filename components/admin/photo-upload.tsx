"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Camera, Image as ImageIcon, X, ZoomIn, ZoomOut, RotateCcw, RefreshCw } from "lucide-react"

interface PhotoUploadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  shape?: "circle" | "square"
  outputSize?: number
}

export function PhotoUpload({
  value,
  onChange,
  shape = "circle",
  outputSize = 600,
}: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [editing, setEditing] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 })
  const [rawSrc, setRawSrc] = useState<string | null>(null)
  const [facing, setFacing] = useState<"user" | "environment">("environment")
  const [cameraError, setCameraError] = useState<string | null>(null)

  function handleFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setRawSrc(src)
      setEditing(true)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
  }

  // ---- Camera (getUserMedia) ----
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    setCameraError(null)
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera unavailable"
      setCameraError(`${msg}. Use "Choose from device" instead.`)
    }
  }, [stopCamera])

  function openCamera() {
    setCameraOpen(true)
    setTimeout(() => startCamera(facing), 50)
  }

  function flipCamera() {
    const next = facing === "user" ? "environment" : "user"
    setFacing(next)
    startCamera(next)
  }

  function snapPhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement("canvas")
    const w = video.videoWidth
    const h = video.videoHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Mirror for front camera so it matches what you see in the preview
    if (facing === "user") {
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    stopCamera()
    setCameraOpen(false)
    setRawSrc(dataUrl)
    setEditing(true)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  function closeCamera() {
    stopCamera()
    setCameraOpen(false)
    setCameraError(null)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // ---- Editor (zoom + drag + circle/square crop) ----
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.complete) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = outputSize
    canvas.height = outputSize
    ctx.clearRect(0, 0, outputSize, outputSize)

    ctx.save()
    if (shape === "circle") {
      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
    }

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const baseScale = Math.max(outputSize / iw, outputSize / ih)
    const scale = baseScale * zoom

    const drawW = iw * scale
    const drawH = ih * scale
    const dx = (outputSize - drawW) / 2 + offset.x
    const dy = (outputSize - drawH) / 2 + offset.y

    ctx.drawImage(img, dx, dy, drawW, drawH)
    ctx.restore()
  }, [zoom, offset, shape, outputSize])

  useEffect(() => {
    if (editing && rawSrc) {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        drawPreview()
      }
      img.src = rawSrc
    }
  }, [editing, rawSrc, drawPreview])

  useEffect(() => { drawPreview() }, [drawPreview])

  function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    onChange(dataUrl)
    setEditing(false)
    setRawSrc(null)
  }

  function handleCancel() {
    setEditing(false)
    setRawSrc(null)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  function handleRemove() { onChange(null) }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y })
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging) return
    setOffset({ x: dragStart.ox + (e.clientX - dragStart.x), y: dragStart.oy + (e.clientY - dragStart.y) })
  }
  function onPointerUp() { setDragging(false) }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white block">Photo</label>

      {/* Idle state: thumbnail + actions */}
      {!editing && !cameraOpen && (
        <div className="flex items-center gap-4">
          <div className={`w-24 h-24 ${shape === "circle" ? "rounded-full" : "rounded-xl"} bg-[#1C1C20] border-2 border-[#27272A] overflow-hidden flex items-center justify-center shrink-0`}>
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={28} className="text-[#3F3F46]" />
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C20] border border-[#27272A] text-white text-xs font-semibold hover:border-[#F97316]/50 transition-colors"
              >
                <ImageIcon size={13} />
                Choose from device
              </button>
              <button
                type="button"
                onClick={openCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C20] border border-[#27272A] text-white text-xs font-semibold hover:border-[#F97316]/50 transition-colors"
              >
                <Camera size={13} />
                Take photo
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                >
                  <X size={13} />
                  Remove
                </button>
              )}
            </div>
            <p className="text-[#52525B] text-xs">After picking, drag to reposition and use the slider to zoom.</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {/* Camera viewfinder */}
      {cameraOpen && (
        <div className="bg-black border border-[#27272A] rounded-2xl p-4 space-y-4">
          {cameraError ? (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-3">
              {cameraError}
            </div>
          ) : (
            <div className="relative aspect-square max-w-md mx-auto bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={closeCamera}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={flipCamera}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C1C20] border border-[#27272A] text-white text-xs font-semibold hover:border-[#F97316]/50 transition-colors"
              >
                <RefreshCw size={13} /> Flip
              </button>
              <button
                type="button"
                onClick={snapPhoto}
                disabled={!!cameraError}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors disabled:opacity-50"
              >
                <Camera size={14} /> Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor state */}
      {editing && (
        <div className="bg-[#1C1C20] border border-[#27272A] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={outputSize}
              height={outputSize}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={`${shape === "circle" ? "rounded-full" : "rounded-xl"} border-2 border-[#F97316]/30 cursor-grab active:cursor-grabbing touch-none`}
              style={{ width: 240, height: 240 }}
            />
            <p className="text-[#71717A] text-xs mt-3">Drag to reposition · Use slider to zoom</p>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-[#71717A] shrink-0" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#F97316]"
            />
            <ZoomIn size={16} className="text-[#71717A] shrink-0" />
            <button
              type="button"
              onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}
              className="ml-2 text-[#71717A] hover:text-white transition-colors"
              aria-label="Reset"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#F97316] text-black text-sm font-semibold hover:bg-[#EA580C] transition-colors">
              Save Photo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
