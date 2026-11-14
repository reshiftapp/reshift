'use client'

import React, { useState } from 'react'
import { UploadCloud, X, Check, Loader2, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  bucket: 'property-images' | 'food-images' | 'event-images' | 'guide-images' | 'carousel-images' | 'notification-images' | 'profilepicture'
  currentUrl?: string | null
  onUploadComplete: (url: string) => void
  label?: string
}

export function ImageUploader({
  bucket,
  currentUrl,
  onUploadComplete,
  label = 'Upload Image',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setPreview(data.url)
      onUploadComplete(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    onUploadComplete('')
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}

      {preview ? (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs font-semibold text-white">
              <Loader2 className="w-5 h-5 animate-spin text-[#5B6FD0]" />
              <span>Uploading to Supabase Storage...</span>
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 hover:border-[#5B6FD0] rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all p-4 group">
          <div className="p-3 rounded-full bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-300 mt-2">
            Click to upload or drag & drop image
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            PNG, JPG, WebP up to 10MB • Bucket: {bucket}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  )
}
