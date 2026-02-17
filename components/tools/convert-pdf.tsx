"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, Loader2 } from "lucide-react"
import { ToolLayout } from "./tool-layout"
import { pdfjsLib } from "@/lib/pdf-worker"

type ImageFormat = "png" | "jpg"

export function ConvertPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [format, setFormat] = useState<ImageFormat>("png")
  const [quality, setQuality] = useState([90])
  const [scale, setScale] = useState([2])
  const [totalPages, setTotalPages] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)

      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
    }
  }

  const handleConvert = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: scale[0] })

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        canvas.height = viewport.height
        canvas.width = viewport.width

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise

          const dataUrl = canvas.toDataURL(`image/${format}`, format === "jpg" ? quality[0] / 100 : undefined)

          const link = document.createElement("a")
          link.href = dataUrl
          link.download = `${file.name.replace(".pdf", "")}_page_${pageNum}.${format}`
          link.click()
        }
      }
    } catch (error) {
      console.error("Error converting PDF:", error)
      alert("Failed to convert PDF. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <ToolLayout title="Convert PDF" description="Convert PDF pages to images">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Select a PDF file to convert to images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{file ? file.name : "Click to upload PDF"}</p>
                  {totalPages > 0 && <p className="text-xs text-muted-foreground mt-1">{totalPages} pages</p>}
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {file && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Output Format</Label>
                    <RadioGroup value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="png" id="png" />
                        <Label htmlFor="png">PNG (Lossless)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jpg" id="jpg" />
                        <Label htmlFor="jpg">JPG (Smaller file size)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {format === "jpg" && (
                    <div>
                      <Label className="mb-2 block">Quality: {quality[0]}%</Label>
                      <Slider value={quality} onValueChange={setQuality} min={1} max={100} step={1} />
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">Scale: {scale[0]}x</Label>
                    <Slider value={scale} onValueChange={setScale} min={1} max={4} step={0.5} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher scale = better quality but larger file size
                    </p>
                  </div>
                </div>

                <Button onClick={handleConvert} disabled={processing} className="w-full">
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Convert to {format.toUpperCase()}
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
