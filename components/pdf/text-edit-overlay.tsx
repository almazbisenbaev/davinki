"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import type { ExtractedTextItem, TextEdit } from "@/lib/pdf-types"
import { AVAILABLE_FONTS } from "@/lib/pdf-types"
import { Bold, Italic, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TextEditOverlayProps {
  textItems: ExtractedTextItem[]
  textEdits: TextEdit[]
  isActive: boolean
  onEditText: (edit: TextEdit) => void
  onUpdateEdit: (id: string, updates: Partial<TextEdit>) => void
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export function TextEditOverlay({
  textItems,
  textEdits,
  isActive,
  onEditText,
  onUpdateEdit,
  fontFamily,
  bold,
  italic,
  underline,
}: TextEditOverlayProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null)

  // Local formatting state for current edit
  const [localBold, setLocalBold] = useState(false)
  const [localItalic, setLocalItalic] = useState(false)
  const [localUnderline, setLocalUnderline] = useState(false)
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily)
  const [localFontSize, setLocalFontSize] = useState(16)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()

      // Position toolbar above input
      const rect = inputRef.current.getBoundingClientRect()
      const containerRect = inputRef.current.closest(".relative")?.getBoundingClientRect()
      if (containerRect) {
        setToolbarPosition({
          top: rect.top - containerRect.top - 44,
          left: rect.left - containerRect.left,
        })
      }
    } else {
      setToolbarPosition(null)
    }
  }, [editingId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setLocalBold((prev) => !prev)
        if (editingId) {
          onUpdateEdit(editingId, { bold: !localBold })
        }
      } else if (modKey && e.key.toLowerCase() === "i") {
        e.preventDefault()
        setLocalItalic((prev) => !prev)
        if (editingId) {
          onUpdateEdit(editingId, { italic: !localItalic })
        }
      } else if (modKey && e.key.toLowerCase() === "u") {
        e.preventDefault()
        setLocalUnderline((prev) => !prev)
        if (editingId) {
          onUpdateEdit(editingId, { underline: !localUnderline })
        }
      } else if (e.key === "Enter") {
        handleSave()
      } else if (e.key === "Escape") {
        setEditingId(null)
        setToolbarPosition(null)
      }
    },
    [editingId, localBold, localItalic, localUnderline, onUpdateEdit],
  )

  const handleTextClick = (item: ExtractedTextItem) => {
    if (!isActive) return

    const existingEdit = textEdits.find((e) => e.originalId === item.id)

    if (existingEdit) {
      setEditingId(existingEdit.id)
      setEditValue(existingEdit.newText)
      setLocalBold(existingEdit.bold || false)
      setLocalItalic(existingEdit.italic || false)
      setLocalUnderline(existingEdit.underline || false)
      setLocalFontFamily(existingEdit.fontFamily || fontFamily)
      setLocalFontSize(existingEdit.fontSize)
    } else {
      // Detect bold/italic from font name
      const fontNameLower = item.fontName.toLowerCase()
      const detectedBold = fontNameLower.includes("bold")
      const detectedItalic = fontNameLower.includes("italic") || fontNameLower.includes("oblique")

      const newEdit: TextEdit = {
        id: `edit-${Date.now()}`,
        originalId: item.id,
        page: item.page,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        originalText: item.text,
        newText: item.text,
        fontSize: item.fontSize,
        color: "#000000",
        fontFamily: localFontFamily,
        bold: detectedBold,
        italic: detectedItalic,
        underline: false,
        pdfX: item.pdfX,
        pdfY: item.pdfY,
        pdfWidth: item.pdfWidth,
        pdfHeight: item.pdfHeight,
        pdfFontSize: item.pdfHeight,
      }
      onEditText(newEdit)
      setEditingId(newEdit.id)
      setEditValue(item.text)
      setLocalBold(detectedBold)
      setLocalItalic(detectedItalic)
      setLocalUnderline(false)
      setLocalFontSize(item.fontSize)
    }
  }

  const handleSave = () => {
    if (editingId) {
      onUpdateEdit(editingId, {
        newText: editValue,
        bold: localBold,
        italic: localItalic,
        underline: localUnderline,
        fontFamily: localFontFamily,
        fontSize: localFontSize,
      })
      setEditingId(null)
      setToolbarPosition(null)
    }
  }

  const handleFontFamilyChange = (value: string) => {
    setLocalFontFamily(value)
    if (editingId) {
      onUpdateEdit(editingId, { fontFamily: value })
    }
  }

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(8, Math.min(72, localFontSize + delta))
    setLocalFontSize(newSize)
    if (editingId) {
      onUpdateEdit(editingId, { fontSize: newSize })
    }
  }

  const getFontStyle = (edit: TextEdit | null) => {
    if (!edit) return {}
    return {
      fontFamily: edit.fontFamily || "sans-serif",
      fontWeight: edit.bold ? "bold" : "normal",
      fontStyle: edit.italic ? "italic" : "normal",
      textDecoration: edit.underline ? "underline" : "none",
    }
  }

  const currentEdit = editingId ? textEdits.find((e) => e.id === editingId) : null

  return (
    <>
      {editingId && toolbarPosition && (
        <div
          className="absolute z-50 flex items-center gap-1 bg-popover border border-border rounded-md shadow-lg p-1"
          style={{
            top: Math.max(0, toolbarPosition.top),
            left: toolbarPosition.left,
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur on input
        >
          <Select value={localFontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border border-border rounded">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFontSizeChange(-1)}>
              -
            </Button>
            <span className="text-xs w-8 text-center">{Math.round(localFontSize)}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFontSizeChange(1)}>
              +
            </Button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant={localBold ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setLocalBold(!localBold)
              if (editingId) onUpdateEdit(editingId, { bold: !localBold })
            }}
            title="Bold (⌘B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={localItalic ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setLocalItalic(!localItalic)
              if (editingId) onUpdateEdit(editingId, { italic: !localItalic })
            }}
            title="Italic (⌘I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={localUnderline ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setLocalUnderline(!localUnderline)
              if (editingId) onUpdateEdit(editingId, { underline: !localUnderline })
            }}
            title="Underline (⌘U)"
          >
            <Underline className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {textItems.map((item) => {
        const edit = textEdits.find((e) => e.originalId === item.id)
        const isEditing = edit && editingId === edit.id
        const isEdited = edit && edit.newText !== edit.originalText

        return (
          <div
            key={item.id}
            className={`absolute transition-all ${
              isActive ? "hover:bg-primary/10 hover:outline hover:outline-1 hover:outline-primary/50 cursor-text" : ""
            }`}
            style={{
              left: item.x,
              top: item.y,
              width: Math.max(item.width, 20),
              height: Math.max(item.height, 16),
              pointerEvents: isActive ? "auto" : "none",
            }}
            onClick={() => handleTextClick(item)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-white border border-primary px-1 text-black outline-none"
                style={{
                  fontSize: localFontSize * 0.9,
                  lineHeight: 1,
                  fontFamily: localFontFamily,
                  fontWeight: localBold ? "bold" : "normal",
                  fontStyle: localItalic ? "italic" : "normal",
                  textDecoration: localUnderline ? "underline" : "none",
                }}
              />
            ) : isEdited && edit ? (
              <div
                className="w-full h-full bg-white flex items-center"
                style={{
                  fontSize: (edit.fontSize || item.fontSize) * 0.9,
                  lineHeight: 1,
                  color: edit.color || "#000000",
                  ...getFontStyle(edit),
                }}
              >
                {edit.newText}
              </div>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
