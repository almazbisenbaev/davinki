"use client"

import type React from "react"

import { useState } from "react"
import { PDFDocument, degrees } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Download, Loader2, FileText, RotateCw, RotateCcw } from "lucide-react"
import { PDFPreview } from "@/components/pdf-preview"

export function RotatePDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [rotatedPdf, setRotatedPdf] = useState<Uint8Array | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())
    }
  }

  const rotatePDF = async () => {
    if (!file || rotation === 0) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const pages = pdfDoc.getPages()
      pages.forEach((page) => {
        page.setRotation(degrees(rotation))
      })

      const pdfBytes = await pdfDoc.save()

      setRotatedPdf(pdfBytes)

      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name.replace(".pdf", "_rotated.pdf")
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Rotation error:", error)
      alert("Failed to rotate PDF. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-2">
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
                      <p className="text-lg font-semibold mb-1">Upload PDF to rotate</p>
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

              <div className="space-y-4">
                <p className="text-sm font-medium">Rotation: {rotation}°</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="flex-1"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Rotate Left 90°
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1"
                    size="lg"
                  >
                    <RotateCw className="h-5 w-5" />
                    Rotate Right 90°
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={rotatePDF} disabled={processing || rotation === 0} className="flex-1" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Rotated PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setRotation(0)
                    setRotatedPdf(null)
                  }}
                  size="lg"
                >
                  Choose Another
                </Button>
              </div>
            </div>
          )}
        </Card>

        {rotatedPdf && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PDFPreview pdfBytes={rotatedPdf} title="Rotated PDF Preview" description={`Rotated ${rotation}°`} />
          </div>
        )}
      </div>
    </div>
  )
}
