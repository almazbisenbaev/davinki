"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Loader2, X, GripVertical, FileText, Plus } from "lucide-react"
import { ToolLayout } from "./tool-layout"
import { PDFDocument } from "pdf-lib"
import { DownloadModal } from "@/components/download-modal"
import { PDFPreview } from "@/components/pdf-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PDFFile {
  id: string
  file: File
  pageCount: number
}

export function MergePDF() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [equalizeWidths, setEqualizeWidths] = useState(false)

  // Clean up blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  }, [pdfBlobUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    for (const file of selectedFiles) {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)

        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            file,
            pageCount: pdfDoc.getPageCount(),
          },
        ])
      }
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setPdfBytes(null)
    setPdfBlobUrl(null)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    setFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(async (file) => {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            file,
            pageCount: pdfDoc.getPageCount(),
          },
        ])
      }
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) return

    setProcessing(true)
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl)
    }
    setPdfBlobUrl(null)
    setPdfBytes(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mergedPdf = await PDFDocument.create()

      let maxWidth = 0
      if (equalizeWidths) {
        for (const { file } of files) {
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          const pages = pdf.getPages()
          pages.forEach((page) => {
            const { width } = page.getSize()
            if (width > maxWidth) maxWidth = width
          })
        }
      }

      for (const { file } of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

        pages.forEach((page) => {
          if (equalizeWidths && maxWidth > 0) {
            const { width, height } = page.getSize()
            if (width !== maxWidth) {
              const scale = maxWidth / width
              page.scale(scale, scale)
            }
          }
          mergedPdf.addPage(page)
        })
      }

      const bytes = await mergedPdf.save()

      const blob = new Blob([bytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      setPdfBytes(bytes)
      setPdfBlobUrl(url)
      setShowDownloadModal(true)
    } catch (error) {
      console.error("Error merging PDFs:", error)
      alert("Failed to merge PDFs. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!pdfBlobUrl) {
      alert("No PDF ready for download")
      return
    }

    const link = document.createElement("a")
    link.href = pdfBlobUrl
    link.download = "merged.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolLayout title="Merge PDFs" description="Combine multiple PDF files into one">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-strong border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Add PDF Files to Merge
            </CardTitle>
            <CardDescription>Upload multiple PDFs and arrange them in the desired order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropZone}
              className={`transition-all duration-300 ${isDragging ? "drag-over" : ""}`}
            >
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:border-primary/50 ${
                  files.length > 0 ? "bg-primary/5 border-primary/30" : ""
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 bg-primary/10 rounded-xl mb-2">
                    {files.length > 0 ? (
                      <Plus className="h-6 w-6 text-primary" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {files.length > 0 ? "Add more PDF files" : "Upload PDF files"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Click or drag and drop multiple files</p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" multiple onChange={handleFileChange} />
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Files to merge ({files.length}) · {files.reduce((acc, f) => acc + f.pageCount, 0)} total pages
                  </p>
                  <p className="text-xs text-muted-foreground">Drag to reorder</p>
                </div>
                <div className="space-y-2">
                  {files.map((pdfFile, index) => (
                    <div
                      key={pdfFile.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-4 bg-muted/50 rounded-xl border-2 transition-all duration-200 hover:bg-muted hover:border-primary/30 cursor-move ${
                        draggedIndex === index ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                        <span className="font-mono text-sm font-semibold min-w-[2rem]">{index + 1}</span>
                      </div>
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pdfFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">{pdfFile.pageCount} pages</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        onClick={() => removeFile(pdfFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length >= 2 && (
              <>
                <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-xl border">
                  <Checkbox
                    id="equalize-widths"
                    checked={equalizeWidths}
                    onCheckedChange={(checked) => setEqualizeWidths(checked as boolean)}
                  />
                  <Label
                    htmlFor="equalize-widths"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Equalize page widths (scale all pages to match the widest page while maintaining aspect ratio)
                  </Label>
                </div>

                <Button onClick={handleMerge} disabled={processing} className="w-full h-12 text-base" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Merging {files.length} PDFs...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Merge {files.length} PDFs into One
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {processing && (
          <Card className="glass-strong border-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        )}

        {pdfBytes && !processing && (
          <PDFPreview
            pdfBytes={pdfBytes}
            title="Merged PDF Preview"
            description="Preview your merged PDF before downloading"
          />
        )}
      </div>

      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onDownload={handleDownload}
        fileName="merged.pdf"
        description="Your merged PDF is ready to download"
      />
    </ToolLayout>
  )
}
