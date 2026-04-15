"use client"

import { useState, useCallback } from "react"
import { FileUpload } from "./pdf/file-upload"
import { PDFViewer } from "./pdf/pdf-viewer"
import { Toolbar } from "./pdf/toolbar"
import { PageThumbnails } from "./pdf/page-thumbnails"
import type { TextAnnotation, DrawingAnnotation, ImageAnnotation } from "@/lib/pdf-types"

export function PDFEditor() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<"select" | "text" | "draw" | "highlight" | "image">("select")
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([])
  const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([])
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([])
  const [textColor, setTextColor] = useState("#000000")
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Inter")
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [drawColor, setDrawColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)

  const handleFileUpload = useCallback((data: ArrayBuffer, name: string) => {
    setPdfData(data)
    setFileName(name)
    setCurrentPage(1)
    setTextAnnotations([])
    setDrawingAnnotations([])
    setImageAnnotations([])
  }, [])

  const handleReset = useCallback(() => {
    setPdfData(null)
    setFileName("")
    setCurrentPage(1)
    setTotalPages(0)
    setTextAnnotations([])
    setDrawingAnnotations([])
    setImageAnnotations([])
  }, [])

  const addTextAnnotation = useCallback((annotation: TextAnnotation) => {
    setTextAnnotations((prev) => [...prev, annotation])
  }, [])

  const updateTextAnnotation = useCallback((id: string, updates: Partial<TextAnnotation>) => {
    setTextAnnotations((prev) => prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)))
  }, [])

  const deleteTextAnnotation = useCallback((id: string) => {
    setTextAnnotations((prev) => prev.filter((ann) => ann.id !== id))
  }, [])

  const addDrawingAnnotation = useCallback((annotation: DrawingAnnotation) => {
    setDrawingAnnotations((prev) => [...prev, annotation])
  }, [])

  const addImageAnnotation = useCallback((annotation: ImageAnnotation) => {
    setImageAnnotations((prev) => [...prev, annotation])
  }, [])

  const updateImageAnnotation = useCallback((id: string, updates: Partial<ImageAnnotation>) => {
    setImageAnnotations((prev) => prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)))
  }, [])

  const deleteImageAnnotation = useCallback((id: string) => {
    setImageAnnotations((prev) => prev.filter((ann) => ann.id !== id))
  }, [])

  if (!pdfData) {
    return <FileUpload onFileUpload={handleFileUpload} />
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        fileName={fileName}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        tool={tool}
        textColor={textColor}
        fontSize={fontSize}
        fontFamily={fontFamily}
        bold={bold}
        italic={italic}
        underline={underline}
        drawColor={drawColor}
        strokeWidth={strokeWidth}
        onZoomChange={setZoom}
        onToolChange={setTool}
        onTextColorChange={setTextColor}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onBoldChange={setBold}
        onItalicChange={setItalic}
        onUnderlineChange={setUnderline}
        onDrawColorChange={setDrawColor}
        onStrokeWidthChange={setStrokeWidth}
        onReset={handleReset}
        pdfData={pdfData}
        textAnnotations={textAnnotations}
        drawingAnnotations={drawingAnnotations}
        imageAnnotations={imageAnnotations}
      />
      <div className="flex flex-1 overflow-hidden">
        <PageThumbnails
          pdfData={pdfData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageSelect={setCurrentPage}
          onTotalPagesChange={setTotalPages}
        />
        <PDFViewer
          pdfData={pdfData}
          currentPage={currentPage}
          zoom={zoom}
          tool={tool}
          textColor={textColor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          bold={bold}
          italic={italic}
          underline={underline}
          drawColor={drawColor}
          strokeWidth={strokeWidth}
          textAnnotations={textAnnotations}
          drawingAnnotations={drawingAnnotations}
          imageAnnotations={imageAnnotations}
          onAddTextAnnotation={addTextAnnotation}
          onUpdateTextAnnotation={updateTextAnnotation}
          onDeleteTextAnnotation={deleteTextAnnotation}
          onAddDrawingAnnotation={addDrawingAnnotation}
          onAddImageAnnotation={addImageAnnotation}
          onUpdateImageAnnotation={updateImageAnnotation}
          onDeleteImageAnnotation={deleteImageAnnotation}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
