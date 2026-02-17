"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PDFDocument } from "pdf-lib"
import { pdfjsLib } from "@/lib/pdf-worker"
import { Upload, Download, GripVertical, Loader2 } from "lucide-react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

interface PageInfo {
  id: string
  pageNumber: number
  thumbnail: string
}

export function ReorderPagesTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      await loadPDFPages(selectedFile)
    }
  }

  const loadPDFPages = async (file: File) => {
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageInfos: PageInfo[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")!
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: context, viewport }).promise
        const thumbnail = canvas.toDataURL()

        pageInfos.push({
          id: `page-${i}`,
          pageNumber: i,
          thumbnail,
        })
      }

      setPages(pageInfos)
    } catch (error) {
      console.error("Error loading PDF:", error)
      alert("Failed to load PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(pages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPages(items)
  }

  const handleReorderPDF = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const newPdfDoc = await PDFDocument.create()

      // Copy pages in the new order
      for (const page of pages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [page.pageNumber - 1])
        newPdfDoc.addPage(copiedPage)
      }

      const pdfBytes = await newPdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reordered_${file.name}`
      a.click()
    } catch (error) {
      console.error("Error reordering pages:", error)
      alert("Failed to reorder pages. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="glass-strong border-2">
        <CardContent className="p-8">
          {!file ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group">
              <div className="text-center space-y-3">
                  <div className="p-4 bg-primary/10 rounded-2xl inline-block transition-colors duration-300">
                  <GripVertical className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Upload PDF</p>
                  <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                </div>
              </div>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
            </label>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading PDF pages...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{pages.length} pages • Drag to reorder</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setPages([])
                  }}
                >
                  Remove File
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pages" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                      {pages.map((page, index) => (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging
                                ? "border-primary shadow-2xl z-50"
                                : "border-border hover:border-primary/50 hover:shadow-sm"
                              }`}
                            >
                              <div className="aspect-[3/4] relative">
                                <img
                                  src={page.thumbnail || "/placeholder.svg"}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute top-2 right-2">
                                    <GripVertical className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2 bg-background/90 backdrop-blur-sm border-t text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-sm font-medium">
                                    Page {index + 1}{" "}
                                    <span className="text-muted-foreground">(was {page.pageNumber})</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button onClick={handleReorderPDF} disabled={processing} className="w-full" size="lg">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reordering Pages...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Save Reordered PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
