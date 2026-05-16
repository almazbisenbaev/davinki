"use client"

import type React from "react"

import { useState, useRef } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, Loader2, FileText, Type, ImageIcon } from "lucide-react"
import { DownloadModal } from "@/components/download-modal"
import { downloadPdfBytes } from "@/lib/utils/download"

type WatermarkMode = "text" | "image"

export function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [mode, setMode] = useState<WatermarkMode>("text")
  const [processedPdf, setProcessedPdf] = useState<Uint8Array | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  // Text watermark state
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [textColor, setTextColor] = useState("#cccccc")
  const [textOpacity, setTextOpacity] = useState(30)
  const [textSize, setTextSize] = useState(60)

  // Image watermark state
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null)
  const [watermarkImageName, setWatermarkImageName] = useState("")
  const [imageOpacity, setImageOpacity] = useState(30)
  const [imageScale, setImageScale] = useState(30)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0]
    if (!img || !img.type.startsWith("image/")) return
    setWatermarkImageName(img.name)
    const reader = new FileReader()
    reader.onload = (ev) => setWatermarkImage(ev.target?.result as string)
    reader.readAsDataURL(img)
    e.target.value = ""
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return { r, g, b }
  }

  const addWatermark = async () => {
    if (!file) return
    if (mode === "text" && !watermarkText) return
    if (mode === "image" && !watermarkImage) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      if (mode === "text") {
        const { r, g, b } = hexToRgb(textColor)
        pages.forEach((page) => {
          const { width, height } = page.getSize()
          page.drawText(watermarkText, {
            x: width / 2 - (watermarkText.length * textSize * 0.3) / 2,
            y: height / 2,
            size: textSize,
            color: rgb(r, g, b),
            opacity: textOpacity / 100,
          })
        })
      } else if (mode === "image" && watermarkImage) {
        const imageBytes = await fetch(watermarkImage).then((r) => r.arrayBuffer())
        const isPng = watermarkImage.startsWith("data:image/png")
        const embeddedImage = isPng
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes)

        pages.forEach((page) => {
          const { width, height } = page.getSize()
          const scaleFactor = imageScale / 100
          const imgWidth = embeddedImage.width * scaleFactor
          const imgHeight = embeddedImage.height * scaleFactor
          page.drawImage(embeddedImage, {
            x: width / 2 - imgWidth / 2,
            y: height / 2 - imgHeight / 2,
            width: imgWidth,
            height: imgHeight,
            opacity: imageOpacity / 100,
          })
        })
      }

      const pdfBytes = await pdfDoc.save()
      setProcessedPdf(pdfBytes)
      setShowDownloadModal(true)
    } catch (error) {
      console.error("Watermark error:", error)
      alert("Failed to add watermark. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedPdf || !file) return
    downloadPdfBytes(processedPdf, file.name.replace(".pdf", "_watermarked.pdf"))
  }

  const canApply = mode === "text" ? !!watermarkText : !!watermarkImage

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-strong border-2 p-8">
        {!file ? (
          <label className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-xl p-12 hover:border-primary transition-all duration-300 hover:bg-primary/5">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-primary/10 rounded-xl">
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
        ) : (
          <div className="space-y-6">
            {/* File info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            {/* Mode tabs */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as WatermarkMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </TabsTrigger>
              </TabsList>

              {/* Text watermark options */}
              <TabsContent value="text" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {textSize}px</Label>
                  <Slider
                    value={[textSize]}
                    onValueChange={([v]) => setTextSize(v)}
                    min={12}
                    max={120}
                    step={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opacity: {textOpacity}%</Label>
                  <Slider
                    value={[textOpacity]}
                    onValueChange={([v]) => setTextOpacity(v)}
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>
              </TabsContent>

              {/* Image watermark options */}
              <TabsContent value="image" className="space-y-4 pt-2">
                {!watermarkImage ? (
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary transition-all duration-300 hover:bg-primary/5">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload watermark image</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or JPEG</p>
                        </div>
                      </div>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{watermarkImageName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setWatermarkImage(null); setWatermarkImageName("") }}
                      >
                        Change
                      </Button>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <img
                        src={watermarkImage}
                        alt="Watermark preview"
                        className="max-h-24 mx-auto object-contain opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Size: {imageScale}% of page width</Label>
                  <Slider
                    value={[imageScale]}
                    onValueChange={([v]) => setImageScale(v)}
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opacity: {imageOpacity}%</Label>
                  <Slider
                    value={[imageOpacity]}
                    onValueChange={([v]) => setImageOpacity(v)}
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={addWatermark}
                disabled={processing || !canApply}
                className="flex-1"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Watermark...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download with Watermark
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setFile(null)} size="lg">
                Change PDF
              </Button>
            </div>
          </div>
        )}
      </Card>

      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onDownload={handleDownload}
        fileName={file ? file.name.replace(".pdf", "_watermarked.pdf") : "watermarked.pdf"}
        description="Your watermarked PDF is ready to download"
      />
    </div>
  )
}
