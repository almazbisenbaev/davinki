"use client"

import {
  Download,
  ZoomIn,
  ZoomOut,
  Type,
  Pencil,
  Highlighter,
  MousePointer,
  ImageIcon,
  Edit3,
  Bold,
  Italic,
  Underline,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TextAnnotation, DrawingAnnotation, ImageAnnotation, TextEdit } from "@/lib/pdf-types"
import { downloadPDF } from "@/lib/pdf-utils"
import { DownloadModal } from "@/components/download-modal"
import { useState } from "react"

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Palatino", label: "Palatino" },
]

interface ToolbarProps {
  fileName: string
  currentPage: number
  totalPages: number
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
  onZoomChange: (zoom: number) => void
  onToolChange: (tool: "select" | "text" | "draw" | "highlight" | "image" | "edit") => void
  onTextColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onBoldChange: (bold: boolean) => void
  onItalicChange: (italic: boolean) => void
  onUnderlineChange: (underline: boolean) => void
  onDrawColorChange: (color: string) => void
  onStrokeWidthChange: (width: number) => void
  onReset: () => void
  pdfData: ArrayBuffer
  textAnnotations: TextAnnotation[]
  drawingAnnotations: DrawingAnnotation[]
  imageAnnotations: ImageAnnotation[]
  textEdits: TextEdit[]
}

export function Toolbar({
  fileName,
  currentPage,
  totalPages,
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
  onZoomChange,
  onToolChange,
  onTextColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onDrawColorChange,
  onStrokeWidthChange,
  onReset,
  pdfData,
  textAnnotations,
  drawingAnnotations,
  imageAnnotations,
  textEdits,
}: ToolbarProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const handleDownload = async () => {
    await downloadPDF(pdfData, textAnnotations, drawingAnnotations, imageAnnotations, textEdits, fileName)
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.25, 3))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.25, 0.5))
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <MousePointer className="h-4 w-4 mr-2" />
            New
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{fileName}</span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "select" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onToolChange("select")}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select</TooltipContent>
          </Tooltip>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant={tool === "edit" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => onToolChange("edit")}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Edit Text</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72" align="center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={onFontFamilyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Text Style</Label>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={bold ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onBoldChange(!bold)}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={italic ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onItalicChange(!italic)}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={underline ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onUnderlineChange(!underline)}
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant={tool === "text" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => onToolChange("text")}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Add Text</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72" align="center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={onFontFamilyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => onTextColorChange(e.target.value)}
                      className="w-10 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => onTextColorChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider value={[fontSize]} onValueChange={([v]) => onFontSizeChange(v)} min={8} max={72} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Text Style</Label>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={bold ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onBoldChange(!bold)}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={italic ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onItalicChange(!italic)}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={underline ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => onUnderlineChange(!underline)}
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant={tool === "draw" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => onToolChange("draw")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Draw</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64" align="center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stroke Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={drawColor}
                      onChange={(e) => onDrawColorChange(e.target.value)}
                      className="w-10 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={drawColor}
                      onChange={(e) => onDrawColorChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stroke Width: {strokeWidth}px</Label>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={([v]) => onStrokeWidthChange(v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "highlight" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onToolChange("highlight")}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Highlight</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "image" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onToolChange("image")}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Image</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button onClick={() => setShowDownloadModal(true)} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onDownload={handleDownload}
        fileName={fileName.replace(".pdf", "_edited.pdf")}
        description="Your edited PDF is ready to download"
      />
    </TooltipProvider>
  )
}
