"use client"

import { useEffect, useState, useRef } from "react"
import { pdfjsLib } from "@/lib/pdf-worker"
import { cn } from "@/lib/utils"

interface PageThumbnailsProps {
  pdfData: ArrayBuffer
  currentPage: number
  totalPages: number
  onPageSelect: (page: number) => void
  onTotalPagesChange: (total: number) => void
}

export function PageThumbnails({
  pdfData,
  currentPage,
  totalPages,
  onPageSelect,
  onTotalPagesChange,
}: PageThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadThumbnails = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) })
      const pdf = await loadingTask.promise
      onTotalPagesChange(pdf.numPages)

      const thumbs: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.2 })

        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height

        const context = canvas.getContext("2d")
        if (context) {
          await page.render({
            canvasContext: context,
            viewport,
          }).promise
          thumbs.push(canvas.toDataURL())
        }
      }
      setThumbnails(thumbs)
    }

    loadThumbnails()
  }, [pdfData, onTotalPagesChange])

  useEffect(() => {
    if (containerRef.current) {
      const activeThumb = containerRef.current.querySelector(`[data-page="${currentPage}"]`)
      activeThumb?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [currentPage])

  return (
    <div
      ref={containerRef}
      className="w-40 border-r border-border bg-muted/30 overflow-y-auto p-3 space-y-3 flex-shrink-0"
    >
      {thumbnails.map((thumb, index) => (
        <button
          key={index}
          data-page={index + 1}
          onClick={() => onPageSelect(index + 1)}
          className={cn(
            "w-full rounded-lg overflow-hidden border-2 transition-all",
            currentPage === index + 1 ? "border-primary shadow-md" : "border-transparent hover:border-border",
          )}
        >
          <img src={thumb || "/placeholder.svg"} alt={`Page ${index + 1}`} className="w-full" />
          <div className="py-1 text-xs text-center bg-card text-muted-foreground">{index + 1}</div>
        </button>
      ))}
      {thumbnails.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: totalPages || 3 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      )}
    </div>
  )
}
