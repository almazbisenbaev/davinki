"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { pdfjsLib } from "@/lib/pdf-worker"

interface PDFPreviewProps {
  pdfBytes: Uint8Array
  title?: string
  description?: string
}

export function PDFPreview({ pdfBytes, title = "PDF Preview", description }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadPDF() {
      try {
        setLoading(true)
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) })
        const pdf = await loadingTask.promise
        if (!cancelled) {
          setPdfDoc(pdf)
          setTotalPages(pdf.numPages)
          setCurrentPage(1)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading PDF preview:", error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPDF()
    return () => { cancelled = true }
  }, [pdfBytes])

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage)
    }
  }, [currentPage, pdfDoc])

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return

    try {
      const page = await pdfDoc.getPage(pageNum)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")!

      const viewport = page.getViewport({ scale: 1.5 })
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport,
      }).promise
    } catch (error) {
      console.error("Error rendering page:", error)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <Card className="glass-strong border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading preview...</div>
          ) : (
            <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-lg" />
          )}
        </div>

        {totalPages > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="gap-1 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="gap-1 bg-transparent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
