"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Download, Loader2, FileText, Check } from "lucide-react"
import { ToolLayout } from "./tool-layout"
import { PDFDocument } from "pdf-lib"
import { pdfjsLib } from "@/lib/pdf-worker"
import { PDFPreview } from "@/components/pdf-preview"

type SplitMode = "all" | "range" | "specific"

export function SplitPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<SplitMode>("all")
  const [rangeStart, setRangeStart] = useState("1")
  const [rangeEnd, setRangeEnd] = useState("")
  const [specificPages, setSpecificPages] = useState("")
  const [processing, setProcessing] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [previewPdfBytes, setPreviewPdfBytes] = useState<Uint8Array | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      await loadPDF(selectedFile)
    }
  }

  const loadPDF = async (selectedFile: File) => {
    setFile(selectedFile)

    const arrayBuffer = await selectedFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const count = pdfDoc.getPageCount()
    setTotalPages(count)
    setRangeEnd(count.toString())

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const thumbs: string[] = []

    for (let i = 1; i <= Math.min(count, 6); i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.5 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")!
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
      thumbs.push(canvas.toDataURL())
    }
    setThumbnails(thumbs)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      await loadPDF(droppedFile)
    }
  }

  const handleSplit = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()

      let pagesToExtract: number[] = []

      if (mode === "all") {
        pagesToExtract = Array.from({ length: totalPages }, (_, i) => i)
      } else if (mode === "range") {
        const start = Number.parseInt(rangeStart) - 1
        const end = Number.parseInt(rangeEnd)
        pagesToExtract = Array.from({ length: end - start }, (_, i) => start + i)
      } else if (mode === "specific") {
        const pages = specificPages.split(",").map((p) => Number.parseInt(p.trim()) - 1)
        pagesToExtract = pages.filter((p) => p >= 0 && p < totalPages)
      }

      // Create separate PDFs for each page
      for (let i = 0; i < pagesToExtract.length; i++) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pagesToExtract[i]])
        newPdf.addPage(copiedPage)

        const pdfBytes = await newPdf.save()

        // Show preview of first page
        if (i === 0) {
          setPreviewPdfBytes(pdfBytes)
        }

        const blob = new Blob([pdfBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${file.name.replace(".pdf", "")}_page_${pagesToExtract[i] + 1}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error splitting PDF:", error)
      alert("Failed to split PDF. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <ToolLayout title="Split PDF" description="Split your PDF into separate files">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-strong border-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload PDF Document
            </CardTitle>
            <CardDescription>Drag and drop or click to select a PDF file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`transition-all duration-300 ${isDragging ? "drag-over" : ""}`}
            >
              <label
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:border-primary/50 ${file ? "bg-primary/5 border-primary/50" : ""}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <div className="p-3 bg-primary/10 rounded-xl mb-3">
                        <Check className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{totalPages} pages</p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-xl mb-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isDragging ? "Drop your PDF here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {thumbnails.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Page Preview</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {thumbnails.map((thumb, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={thumb || "/placeholder.svg"}
                        alt={`Page ${i + 1}`}
                        className="w-full rounded-lg border-2 border-border hover:border-primary transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Page {i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {file && (
              <>
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                  <Label className="text-base font-semibold">Split Options</Label>
                  <RadioGroup value={mode} onValueChange={(v) => setMode(v as SplitMode)} className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="cursor-pointer flex-1">
                        <span className="font-medium">Split into individual pages</span>
                        <p className="text-xs text-muted-foreground">Create {totalPages} separate PDF files</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="range" id="range" />
                      <Label htmlFor="range" className="cursor-pointer flex-1">
                        <span className="font-medium">Extract page range</span>
                        <p className="text-xs text-muted-foreground">Select start and end pages</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label htmlFor="specific" className="cursor-pointer flex-1">
                        <span className="font-medium">Extract specific pages</span>
                        <p className="text-xs text-muted-foreground">Enter comma-separated page numbers</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {mode === "range" && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="mb-2 block">From page</Label>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="mb-2 block">To page</Label>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                  </div>
                )}

                {mode === "specific" && (
                  <div>
                    <Label className="mb-2 block">Page numbers (comma-separated)</Label>
                    <Input
                      placeholder="e.g., 1, 3, 5, 7"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Enter the page numbers you want to extract</p>
                  </div>
                )}

                <Button onClick={handleSplit} disabled={processing} className="w-full h-12 text-base" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Splitting PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Split PDF
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {previewPdfBytes && (
          <PDFPreview
            pdfBytes={previewPdfBytes}
            title="Split Result Preview"
            description="Preview of the first extracted page"
          />
        )}
      </div>

    </ToolLayout>
  )
}
