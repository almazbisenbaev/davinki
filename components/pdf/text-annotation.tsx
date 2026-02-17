"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { TextAnnotation } from "@/lib/pdf-types"
import { Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TextAnnotationComponentProps {
  annotation: TextAnnotation
  isSelectable: boolean
  onUpdate: (updates: Partial<TextAnnotation>) => void
  onDelete: () => void
}

export function TextAnnotationComponent({
  annotation,
  isSelectable,
  onUpdate,
  onDelete,
}: TextAnnotationComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (isSelectable) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ text: e.target.value })
  }

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

  const fontStyle = {
    fontFamily: annotation.fontFamily || "sans-serif",
    fontWeight: annotation.bold ? "bold" : "normal",
    fontStyle: annotation.italic ? "italic" : "normal",
    textDecoration: annotation.underline ? "underline" : "none",
  }

  return (
    <div
      className={`absolute group ${isSelectable ? "cursor-move" : "pointer-events-none"}`}
      style={{
        left: annotation.x,
        top: annotation.y,
        zIndex: isDragging ? 1000 : 10,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
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
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={annotation.text}
          onChange={handleChange}
          onBlur={handleBlur}
          className="bg-card/80 border border-primary rounded px-2 py-1 outline-none resize-both min-w-[100px] min-h-[30px]"
          style={{
            color: annotation.color,
            fontSize: annotation.fontSize,
            ...fontStyle,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className={`px-1 whitespace-pre-wrap ${isSelected ? "ring-2 ring-primary ring-offset-2 rounded" : ""}`}
          style={{
            color: annotation.color,
            fontSize: annotation.fontSize,
            ...fontStyle,
          }}
        >
          {annotation.text}
        </div>
      )}
    </div>
  )
}
