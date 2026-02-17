"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Loader2 } from "lucide-react"
import { ToolLayout } from "./tool-layout"
import { pdfjsLib } from "@/lib/pdf-worker"

export function ExtractImages() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setImages([])
    }
  }

  const handleExtract = async () => {
    if (!file) return

    setProcessing(true)
    setImages([])

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const extractedImages: string[] = []

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)

        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext("2d")

        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise
        }

        const operatorList = await page.getOperatorList()
        const imagePromises: Promise<void>[] = []

        for (let i = 0; i < operatorList.fnArray.length; i++) {
          if (
            operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
            operatorList.fnArray[i] === pdfjsLib.OPS.paintInlineImageXObject ||
            operatorList.fnArray[i] === pdfjsLib.OPS.paintJpegXObject
          ) {
            const imageName = operatorList.argsArray[i][0]

            const imagePromise = new Promise<void>((resolve) => {
              page.objs.ensure(imageName, (image) => {
                if (image && image.width && image.height) {
                  try {
                    const imgCanvas = document.createElement("canvas")
                    imgCanvas.width = image.width
                    imgCanvas.height = image.height
                    const imgCtx = imgCanvas.getContext("2d")

                    if (imgCtx && image.data) {
                      const imageData = imgCtx.createImageData(image.width, image.height)

                      if (image.data.length === image.width * image.height * 4) {
                        imageData.data.set(image.data)
                      } else if (image.data.length === image.width * image.height * 3) {
                        // RGB to RGBA conversion
                        for (let j = 0; j < image.width * image.height; j++) {
                          imageData.data[j * 4] = image.data[j * 3]
                          imageData.data[j * 4 + 1] = image.data[j * 3 + 1]
                          imageData.data[j * 4 + 2] = image.data[j * 3 + 2]
                          imageData.data[j * 4 + 3] = 255
                        }
                      } else if (image.data.length === image.width * image.height) {
                        // Grayscale to RGBA
                        for (let j = 0; j < image.width * image.height; j++) {
                          const gray = image.data[j]
                          imageData.data[j * 4] = gray
                          imageData.data[j * 4 + 1] = gray
                          imageData.data[j * 4 + 2] = gray
                          imageData.data[j * 4 + 3] = 255
                        }
                      }

                      imgCtx.putImageData(imageData, 0, 0)
                      const dataUrl = imgCanvas.toDataURL("image/png")
                      extractedImages.push(dataUrl)
                    }
                  } catch (err) {
                    console.error("Error processing image:", err)
                  }
                }
                resolve()
              })
            })

            imagePromises.push(imagePromise)
          }
        }

        await Promise.all(imagePromises)
      }

      setImages(extractedImages)
    } catch (error) {
      console.error("Error extracting images:", error)
      alert("Failed to extract images. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${file?.name.replace(".pdf", "")}_image_${index + 1}.png`
    link.click()
  }

  const downloadAll = () => {
    images.forEach((dataUrl, index) => {
      setTimeout(() => downloadImage(dataUrl, index), index * 100)
    })
  }

  return (
    <ToolLayout title="Extract Images" description="Extract all images from a PDF document">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Select a PDF file to extract images from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{file ? file.name : "Click to upload PDF"}</p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {file && (
              <Button onClick={handleExtract} disabled={processing} className="w-full">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Images...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Extract Images
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {images.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Images</CardTitle>
                  <CardDescription>{images.length} images found</CardDescription>
                </div>
                <Button onClick={downloadAll} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((dataUrl, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={dataUrl || "/placeholder.svg"}
                      alt={`Extracted ${index + 1}`}
                      className="w-full h-48 object-contain bg-muted rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(dataUrl, index)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
