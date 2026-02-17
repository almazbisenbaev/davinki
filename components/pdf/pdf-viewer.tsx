"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { pdfjsLib } from "@/lib/pdf-worker"
import type {
  TextAnnotation,
  DrawingAnnotation,
  ImageAnnotation,
  Point,
  ExtractedTextItem,
  TextEdit,
} from "@/lib/pdf-types"
import { TextAnnotationComponent } from "./text-annotation"
import { ImageAnnotationComponent } from "./image-annotation"
import { TextEditOverlay } from "./text-edit-overlay"
import { v4 as uuidv4 } from "uuid"

interface PDFViewerProps {
  pdfData: ArrayBuffer
  currentPage: number
  zoom: number
  tool: "select" | "text" | "draw" | "highlight" | "image" | "edit"
  textColor: string
  fontSize: number
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
  drawColor: string
  strokeWidth: number
  textAnnotations: TextAnnotation[]
  drawingAnnotations: DrawingAnnotation[]
  imageAnnotations: ImageAnnotation[]
  textEdits: TextEdit[]
  onAddTextAnnotation: (annotation: TextAnnotation) => void
  onUpdateTextAnnotation: (id: string, updates: Partial<TextAnnotation>) => void
  onDeleteTextAnnotation: (id: string) => void
  onAddDrawingAnnotation: (annotation: DrawingAnnotation) => void
  onAddImageAnnotation: (annotation: ImageAnnotation) => void
  onUpdateImageAnnotation: (id: string, updates: Partial<ImageAnnotation>) => void
  onDeleteImageAnnotation: (id: string) => void
  onAddTextEdit: (edit: TextEdit) => void
  onUpdateTextEdit: (id: string, updates: Partial<TextEdit>) => void
  onPageChange: (page: number) => void
  totalPages: number
}

export function PDFViewer({
  pdfData,
  currentPage,
  zoom,
  tool,
  textColor,
  fontSize,
  fontFamily,
  bold,
  italic,
  underline,
  drawColor,
  strokeWidth,
  textAnnotations,
  drawingAnnotations,
  imageAnnotations,
  textEdits,
  onAddTextAnnotation,
  onUpdateTextAnnotation,
  onDeleteTextAnnotation,
  onAddDrawingAnnotation,
  onAddImageAnnotation,
  onUpdateImageAnnotation,
  onDeleteImageAnnotation,
  onAddTextEdit,
  onUpdateTextEdit,
  onPageChange,
  totalPages,
}: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImagePosition, setPendingImagePosition] = useState<{ x: number; y: number } | null>(null)
  const [extractedText, setExtractedText] = useState<ExtractedTextItem[]>([])
  const [pageInfo, setPageInfo] = useState<{ pdfWidth: number; pdfHeight: number }>({ pdfWidth: 0, pdfHeight: 0 })

  const scale = zoom * 1.5

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return

      const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) })
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(currentPage)

      const viewport = page.getViewport({ scale })
      const originalViewport = page.getViewport({ scale: 1 })

      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = viewport.width
        canvas.height = viewport.height
        setDimensions({ width: viewport.width, height: viewport.height })
        setPageInfo({ pdfWidth: originalViewport.width, pdfHeight: originalViewport.height })

        await page.render({
          canvasContext: context,
          viewport,
        }).promise

        const textContent = await page.getTextContent()
        const textItems: ExtractedTextItem[] = []

        for (const item of textContent.items) {
          if ("str" in item && item.str.trim()) {
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform)
            const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3])

            const originalTx = pdfjsLib.Util.transform(originalViewport.transform, item.transform)
            const originalFontHeight = Math.sqrt(originalTx[2] * originalTx[2] + originalTx[3] * originalTx[3])

            textItems.push({
              id: `text-${currentPage}-${textItems.length}`,
              page: currentPage,
              text: item.str,
              x: tx[4],
              y: tx[5] - fontHeight,
              width: item.width * viewport.scale,
              height: fontHeight,
              fontSize: fontHeight,
              fontName: item.fontName || "Helvetica",
              pdfX: originalTx[4],
              pdfY: originalTx[5],
              pdfWidth: item.width,
              pdfHeight: originalFontHeight,
            })
          }
        }
        setExtractedText(textItems)
      }
    }

    renderPage()
  }, [pdfData, currentPage, zoom, scale])

  useEffect(() => {
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.width = dimensions.width
      drawingCanvasRef.current.height = dimensions.height
      redrawAnnotations()
    }
  }, [dimensions])

  const redrawAnnotations = useCallback(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const pageAnnotations = drawingAnnotations.filter((a) => a.page === currentPage)
    pageAnnotations.forEach((annotation) => {
      ctx.beginPath()
      ctx.strokeStyle = annotation.color
      ctx.lineWidth = annotation.strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (annotation.type === "highlight") {
        ctx.globalAlpha = 0.3
      } else {
        ctx.globalAlpha = 1
      }

      annotation.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
      ctx.globalAlpha = 1
    })
  }, [drawingAnnotations, currentPage])

  useEffect(() => {
    redrawAnnotations()
  }, [redrawAnnotations])

  const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool === "text") {
        const point = getCanvasPoint(e)
        const newAnnotation: TextAnnotation = {
          id: uuidv4(),
          page: currentPage,
          x: point.x,
          y: point.y,
          text: "New text",
          color: textColor,
          fontSize: fontSize,
          fontFamily: fontFamily,
          bold: bold,
          italic: italic,
          underline: underline,
        }
        onAddTextAnnotation(newAnnotation)
      } else if (tool === "image") {
        const point = getCanvasPoint(e)
        setPendingImagePosition(point)
        fileInputRef.current?.click()
      }
    },
    [tool, currentPage, textColor, fontSize, fontFamily, bold, italic, underline, onAddTextAnnotation, getCanvasPoint],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (tool === "draw" || tool === "highlight") {
        setIsDrawing(true)
        const point = getCanvasPoint(e)
        setCurrentPath([point])
      }
    },
    [tool, getCanvasPoint],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing) return

      const point = getCanvasPoint(e)
      setCurrentPath((prev) => [...prev, point])

      const canvas = drawingCanvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      redrawAnnotations()

      ctx.beginPath()
      ctx.strokeStyle = tool === "highlight" ? "#FFFF00" : drawColor
      ctx.lineWidth = tool === "highlight" ? strokeWidth * 3 : strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.globalAlpha = tool === "highlight" ? 0.3 : 1

      currentPath.forEach((p, index) => {
        if (index === 0) {
          ctx.moveTo(p.x, p.y)
        } else {
          ctx.lineTo(p.x, p.y)
        }
      })
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      ctx.globalAlpha = 1
    },
    [isDrawing, currentPath, tool, drawColor, strokeWidth, getCanvasPoint, redrawAnnotations],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return

    if (currentPath.length > 1) {
      const newAnnotation: DrawingAnnotation = {
        id: uuidv4(),
        page: currentPage,
        points: currentPath,
        color: tool === "highlight" ? "#FFFF00" : drawColor,
        strokeWidth: tool === "highlight" ? strokeWidth * 3 : strokeWidth,
        type: tool === "highlight" ? "highlight" : "draw",
      }
      onAddDrawingAnnotation(newAnnotation)
    }

    setIsDrawing(false)
    setCurrentPath([])
  }, [isDrawing, currentPath, currentPage, tool, drawColor, strokeWidth, onAddDrawingAnnotation])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !pendingImagePosition) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const newAnnotation: ImageAnnotation = {
          id: uuidv4(),
          page: currentPage,
          x: pendingImagePosition.x,
          y: pendingImagePosition.y,
          width: 200,
          height: 150,
          src: dataUrl,
        }
        onAddImageAnnotation(newAnnotation)
        setPendingImagePosition(null)
      }
      reader.readAsDataURL(file)
      e.target.value = ""
    },
    [pendingImagePosition, currentPage, onAddImageAnnotation],
  )

  const handleScroll = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return

      const container = containerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container

      if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 10) {
        if (currentPage < totalPages) {
          onPageChange(currentPage + 1)
          container.scrollTop = 0
        }
      } else if (e.deltaY < 0 && scrollTop <= 10) {
        if (currentPage > 1) {
          onPageChange(currentPage - 1)
          container.scrollTop = scrollHeight
        }
      }
    },
    [currentPage, totalPages, onPageChange],
  )

  const pageTextAnnotations = textAnnotations.filter((a) => a.page === currentPage)
  const pageImageAnnotations = imageAnnotations.filter((a) => a.page === currentPage)
  const pageExtractedText = extractedText.filter((t) => t.page === currentPage)
  const pageTextEdits = textEdits.filter((e) => e.page === currentPage)

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-muted/50 p-8" onWheel={handleScroll}>
      <div
        className="relative mx-auto shadow-xl bg-card"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
        <canvas
          ref={drawingCanvasRef}
          className={`absolute top-0 left-0 ${
            tool === "draw" || tool === "highlight"
              ? "cursor-crosshair"
              : tool === "text" || tool === "image"
                ? "cursor-cell"
                : tool === "edit"
                  ? "cursor-text"
                  : "cursor-default"
          }`}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <TextEditOverlay
          textItems={pageExtractedText}
          textEdits={pageTextEdits}
          isActive={tool === "edit"}
          onEditText={onAddTextEdit}
          onUpdateEdit={onUpdateTextEdit}
          fontFamily={fontFamily}
          bold={bold}
          italic={italic}
          underline={underline}
        />
        {pageTextAnnotations.map((annotation) => (
          <TextAnnotationComponent
            key={annotation.id}
            annotation={annotation}
            isSelectable={tool === "select"}
            onUpdate={(updates) => onUpdateTextAnnotation(annotation.id, updates)}
            onDelete={() => onDeleteTextAnnotation(annotation.id)}
          />
        ))}
        {pageImageAnnotations.map((annotation) => (
          <ImageAnnotationComponent
            key={annotation.id}
            annotation={annotation}
            isSelectable={tool === "select"}
            onUpdate={(updates) => onUpdateImageAnnotation(annotation.id, updates)}
            onDelete={() => onDeleteImageAnnotation(annotation.id)}
          />
        ))}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  )
}
