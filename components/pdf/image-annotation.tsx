"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { ImageAnnotation } from "@/lib/pdf-types"
import { Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageAnnotationComponentProps {
  annotation: ImageAnnotation
  isSelectable: boolean
  onUpdate: (updates: Partial<ImageAnnotation>) => void
  onDelete: () => void
}

export function ImageAnnotationComponent({
  annotation,
  isSelectable,
  onUpdate,
  onDelete,
}: ImageAnnotationComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelectable) return
    e.preventDefault()
    e.stopPropagation()

    setIsSelected(true)
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - annotation.x,
      y: e.clientY - annotation.y,
    }

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isSelectable) return
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    resizeStart.current = {
      width: annotation.width,
      height: annotation.height,
      x: e.clientX,
      y: e.clientY,
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.current.x
      const deltaY = e.clientY - resizeStart.current.y
      const newWidth = Math.max(50, resizeStart.current.width + deltaX)
      const newHeight = Math.max(50, resizeStart.current.height + deltaY)
      onUpdate({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectable) {
      e.stopPropagation()
      setIsSelected(true)
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setIsSelected(false)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div
      className={`absolute ${isSelectable ? "cursor-move" : "pointer-events-none"}`}
      style={{
        left: annotation.x,
        top: annotation.y,
        width: annotation.width,
        height: annotation.height,
        zIndex: isDragging || isResizing ? 1000 : 10,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {isSelected && isSelectable && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-card border border-border rounded-md shadow-md p-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      )}
      <img
        src={annotation.src || "/placeholder.svg"}
        alt="Annotation"
        className={`w-full h-full object-contain ${isSelected ? "ring-2 ring-primary" : ""}`}
        draggable={false}
      />
      {isSelected && isSelectable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  )
}
