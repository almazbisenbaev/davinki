"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PDFDocument, rgb } from "pdf-lib"
import { Upload, Download, Hash, Loader2 } from "lucide-react"

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
type Format = "1" | "Page 1" | "1/10" | "Page 1 of 10"

export function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState<Position>("bottom-center")
  const [format, setFormat] = useState<Format>("1")
  const [startNumber, setStartNumber] = useState(1)
  const [fontSize, setFontSize] = useState(12)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState<string>("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
    }
  }

  const getFormatted = (current: number, total: number): string => {
    switch (format) {
      case "1":
        return current.toString()
      case "Page 1":
        return `Page ${current}`
      case "1/10":
        return `${current}/${total}`
      case "Page 1 of 10":
        return `Page ${current} of ${total}`
    }
  }

  const handleAddPageNumbers = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const totalPages = pages.length

      pages.forEach((page, index) => {
        const { width, height } = page.getSize()
        const pageNumber = startNumber + index
        const text = getFormatted(pageNumber, totalPages)

        let x = 0
        let y = 0

        // Calculate position
        const textWidth = fontSize * text.length * 0.5
        const margin = 30

        if (position.includes("left")) x = margin
        else if (position.includes("center")) x = (width - textWidth) / 2
        else if (position.includes("right")) x = width - textWidth - margin

        if (position.includes("top")) y = height - margin - fontSize
        else if (position.includes("bottom")) y = margin

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          color: rgb(0.2, 0.2, 0.2),
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `numbered_${file.name}`
      a.click()
    } catch (error) {
      console.error("Error adding page numbers:", error)
      alert("Failed to add page numbers. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="glass-strong border-2">
        <CardContent className="p-8">
          <div className="space-y-6">
            {!file ? (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group">
                <div className="text-center space-y-3">
                  <div className="p-4 bg-primary/10 rounded-2xl inline-block transition-colors duration-300">
                    <Hash className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Upload PDF</p>
                    <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                  </div>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1, 2, 3...</SelectItem>
                        <SelectItem value="Page 1">Page 1, Page 2...</SelectItem>
                        <SelectItem value="1/10">1/10, 2/10...</SelectItem>
                        <SelectItem value="Page 1 of 10">Page 1 of 10...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Number</Label>
                    <Input
                      type="number"
                      min={1}
                      value={startNumber}
                      onChange={(e) => setStartNumber(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      min={8}
                      max={24}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={handleAddPageNumbers} disabled={processing} className="w-full" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Page Numbers...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Add Page Numbers & Download
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
