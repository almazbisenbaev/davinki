"use client"

import type React from "react"

import { useState } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, Loader2, FileText } from "lucide-react"

export function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [pageCount, setPageCount] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())
    }
  }

  const addWatermark = async () => {
    if (!file || !watermarkText) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const pages = pdfDoc.getPages()
      pages.forEach((page) => {
        const { width, height } = page.getSize()
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 20) / 2,
          y: height / 2,
          size: 60,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.3,
        })
      })

      const pdfBytes = await pdfDoc.save()

      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name.replace(".pdf", "_watermarked.pdf")
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Watermark error:", error)
      alert("Failed to add watermark. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-strong border-2 p-8">
        {!file ? (
          <div className="text-center">
            <label className="cursor-pointer group">
              <div className="border-2 border-dashed border-border rounded-xl p-12 hover:border-primary transition-all duration-300 hover:bg-primary/5">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl transition-colors duration-300">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-1">Upload PDF for watermark</p>
                    <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                  </div>
                </div>
              </div>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark">Watermark Text</Label>
              <Input
                id="watermark"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">This text will appear centered on each page</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={addWatermark} disabled={processing || !watermarkText} className="flex-1" size="lg">
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding Watermark...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download with Watermark
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setFile(null)} size="lg">
                Choose Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
