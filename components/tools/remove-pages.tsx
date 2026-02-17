"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PDFDocument } from "pdf-lib"
import { pdfjsLib } from "@/lib/pdf-worker"
import { Upload, Trash2, Loader2, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface PageInfo {
  pageNumber: number
  thumbnail: string
  selected: boolean
}

export function RemovePagesTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      await loadPDFPages(selectedFile)
    }
  }

  const loadPDFPages = async (file: File) => {
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageInfos: PageInfo[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")!
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: context, viewport }).promise
        const thumbnail = canvas.toDataURL()

        pageInfos.push({
          pageNumber: i,
          thumbnail,
          selected: false,
        })
      }

      setPages(pageInfos)
    } catch (error) {
      console.error("Error loading PDF:", error)
      alert("Failed to load PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const togglePage = (pageNumber: number) => {
    setPages((prev) => prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p)))
  }

  const handleRemovePages = async () => {
    if (!file) return

    const selectedPages = pages.filter((p) => p.selected).map((p) => p.pageNumber)
    if (selectedPages.length === 0) {
      alert("Please select at least one page to remove")
      return
    }

    if (selectedPages.length === pages.length) {
      alert("You cannot remove all pages from the PDF")
      return
    }

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Remove pages in reverse order to avoid index shifting
      const sortedPages = [...selectedPages].sort((a, b) => b - a)
      for (const pageNum of sortedPages) {
        pdfDoc.removePage(pageNum - 1)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `removed_pages_${file.name}`
      a.click()
    } catch (error) {
      console.error("Error removing pages:", error)
      alert("Failed to remove pages. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const selectedCount = pages.filter((p) => p.selected).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="glass-strong border-2">
        <CardContent className="p-8">
          {!file ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group">
              <div className="text-center space-y-3">
                  <div className="p-4 bg-primary/10 rounded-2xl inline-block transition-colors duration-300">
                  <Trash2 className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Upload PDF</p>
                  <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                </div>
              </div>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
            </label>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading PDF pages...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pages.length} pages • {selectedCount} selected for removal
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setPages([])
                  }}
                >
                  Remove File
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      page.selected
                        ? "border-red-500 bg-red-500/10 opacity-80"
                        : "border-border hover:border-primary/50 hover:shadow-sm"
                    }`}
                    onClick={() => togglePage(page.pageNumber)}
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={page.thumbnail || "/placeholder.svg"}
                        alt={`Page ${page.pageNumber}`}
                        className={`w-full h-full object-contain ${page.selected ? "opacity-50" : ""}`}
                      />
                      {page.selected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-3 bg-red-500 rounded-full">
                            <X className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-background/90 backdrop-blur-sm border-t text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Checkbox checked={page.selected} />
                        <span className="text-sm font-medium">Page {page.pageNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleRemovePages}
                disabled={processing || selectedCount === 0}
                className="w-full"
                size="lg"
                variant={selectedCount > 0 ? "destructive" : "default"}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Removing Pages...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Remove {selectedCount} Page{selectedCount !== 1 ? "s" : ""} & Download
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
