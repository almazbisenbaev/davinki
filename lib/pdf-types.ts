/**
 * Type definitions for PDF operations
 */

export interface Point {
  x: number
  y: number
}

export interface TextSegment {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

/**
 * Represents a text annotation added to a PDF
 */
export interface TextAnnotation {
  id: string
  page: number
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  fontFamily: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  segments?: TextSegment[]
}

/**
 * Represents a drawing or highlight annotation
 */
export interface DrawingAnnotation {
  id: string
  page: number
  points: Point[]
  color: string
  strokeWidth: number
  type: "draw" | "highlight"
}

/**
 * Represents an image annotation embedded in a PDF
 */
export interface ImageAnnotation {
  id: string
  page: number
  x: number
  y: number
  width: number
  height: number
  src: string
}

/**
 * Represents extracted text from a PDF with position information
 */
export interface ExtractedTextItem {
  id: string
  page: number
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontName: string
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfHeight: number
  detectedBold?: boolean
  detectedItalic?: boolean
}

/**
 * Represents an edit made to existing text in a PDF
 */
export interface TextEdit {
  id: string
  originalId: string
  page: number
  x: number
  y: number
  width: number
  height: number
  originalText: string
  newText: string
  fontSize: number
  color: string
  fontFamily: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfHeight: number
  pdfFontSize: number
  segments?: TextSegment[]
}

/**
 * Available font options for PDF text
 */
export const AVAILABLE_FONTS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Palatino", value: "Palatino Linotype, serif" },
] as const
