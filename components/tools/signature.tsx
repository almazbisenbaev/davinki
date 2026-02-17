"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFDocument } from "pdf-lib"
import { Upload, Download, PenTool, ImageIcon, Loader2, Trash2 } from "lucide-react"

export function SignatureTool() {
  const [file, setFile] = useState<File | null>(null)
  const [signatureImage, setSignatureImage] = useState<string>("")
  const [processing, setProcessing] = useState(false)
  const [signatureTab, setSignatureTab] = useState<"draw" | "upload">("draw")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSignatureImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      const rect = canvas.getBoundingClientRect()
      ctx?.beginPath()
      ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      const rect = canvas.getBoundingClientRect()
      ctx?.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      ctx?.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignatureImage(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      setSignatureImage("")
    }
  }

  const handleAddSignature = async () => {
    if (!file || !signatureImage) {
      alert("Please upload a PDF and create/upload a signature")
      return
    }

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Embed signature image
      const signatureBytes = await fetch(signatureImage).then((res) => res.arrayBuffer())
      const signatureImg = signatureImage.includes("png")
        ? await pdfDoc.embedPng(signatureBytes)
        : await pdfDoc.embedJpg(signatureBytes)

      // Add signature to the last page (bottom right)
      const pages = pdfDoc.getPages()
      const lastPage = pages[pages.length - 1]
      const { width, height } = lastPage.getSize()

      const signatureWidth = 150
      const signatureHeight = (signatureImg.height / signatureImg.width) * signatureWidth

      lastPage.drawImage(signatureImg, {
        x: width - signatureWidth - 50,
        y: 50,
        width: signatureWidth,
        height: signatureHeight,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `signed_${file.name}`
      a.click()
    } catch (error) {
      console.error("Error adding signature:", error)
      alert("Failed to add signature. Please try again.")
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
                    <PenTool className="h-12 w-12 text-primary" />
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

                <Tabs value={signatureTab} onValueChange={(v) => setSignatureTab(v as "draw" | "upload")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">
                      <PenTool className="h-4 w-4 mr-2" />
                      Draw Signature
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Image
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="space-y-4">
                    <div className="border-2 border-dashed border-primary/30 rounded-xl overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full bg-white cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <Button variant="outline" onClick={clearSignature} className="w-full bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Signature
                    </Button>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300">
                      <div className="text-center space-y-2">
                        <ImageIcon className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-sm font-medium">Upload Signature Image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleSignatureUpload}
                      />
                    </label>
                    {signatureImage && signatureTab === "upload" && (
                      <div className="p-4 bg-white rounded-xl border">
                        <img src={signatureImage || "/placeholder.svg"} alt="Signature" className="max-h-32 mx-auto" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {signatureImage && (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <div className="bg-white p-4 rounded-lg">
                      <img
                        src={signatureImage || "/placeholder.svg"}
                        alt="Signature preview"
                        className="max-h-24 mx-auto"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddSignature}
                  disabled={processing || !signatureImage}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Signature...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Add Signature & Download
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
