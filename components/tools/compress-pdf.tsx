"use client"

import type React from "react"

import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, Loader2, FileText } from "lucide-react"
import { DownloadModal } from "@/components/download-modal"
import { PDFPreview } from "@/components/pdf-preview"

export function CompressPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [quality, setQuality] = useState([75])
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [pdfToDownload, setPdfToDownload] = useState<Uint8Array | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setOriginalSize(selectedFile.size)
      setCompressedSize(0)
    }
  }

  const compressPDF = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      setCompressedSize(pdfBytes.length)
      setPdfToDownload(pdfBytes)
      setShowDownloadModal(true)
    } catch (error) {
      console.error("Compression error:", error)
      alert("Failed to compress PDF. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!pdfToDownload || !file) return
    const blob = new Blob([pdfToDownload], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name.replace(".pdf", "_compressed.pdf")
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB"
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
                      <p className="text-lg font-semibold mb-1">Upload PDF to compress</p>
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
                  <p className="text-sm text-muted-foreground">Original size: {formatSize(originalSize)}</p>
                  {compressedSize > 0 && (
                    <p className="text-sm text-primary font-medium">
                      Compressed size: {formatSize(compressedSize)} (
                      {Math.round((1 - compressedSize / originalSize) * 100)}% reduction)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Compression Quality: {quality[0]}%</Label>
                <Slider value={quality} onValueChange={setQuality} min={50} max={100} step={5} className="w-full" />
                <p className="text-xs text-muted-foreground">Higher quality means larger file size</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={compressPDF} disabled={processing} className="flex-1" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Compress & Download
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setCompressedSize(0)
                  }}
                  size="lg"
                >
                  Choose Another
                </Button>
              </div>
            </div>
          )}
        </Card>

        {pdfToDownload && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PDFPreview
              pdfBytes={pdfToDownload}
              title="Compressed PDF Preview"
              description={`Reduced by ${Math.round((1 - compressedSize / originalSize) * 100)}%`}
            />
          </div>
        )}
      </div>

      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onDownload={handleDownload}
        fileName={file ? file.name.replace(".pdf", "_compressed.pdf") : "compressed.pdf"}
        fileSize={compressedSize > 0 ? formatSize(compressedSize) : undefined}
        description="Your compressed PDF is ready to download"
      />
    </div>
  )
}
