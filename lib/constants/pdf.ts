/**
 * PDF-related constants and configuration
 */

/**
 * Scale factor used for PDF rendering and coordinate conversion
 */
export const PDF_SCALE = 1.5

/**
 * Default colors for annotations
 */
export const DEFAULT_COLORS = {
  TEXT: "#000000",
  HIGHLIGHT: "#ffff00",
  DRAWING: "#ff0000",
} as const

/**
 * Default font sizes for annotations (in pixels)
 */
export const DEFAULT_FONT_SIZES = {
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 20,
  XLARGE: 24,
} as const

/**
 * Maximum file size for PDF uploads (in bytes)
 * Default: 50MB
 */
export const MAX_PDF_FILE_SIZE = 50 * 1024 * 1024

/**
 * Supported image formats for PDF operations
 */
export const SUPPORTED_IMAGE_FORMATS = ["image/png", "image/jpeg", "image/jpg"] as const

/**
 * PDF.js worker configuration
 */
export const PDFJS_WORKER_VERSION = "4.4.168"
export const PDFJS_WORKER_URL = `https://unpkg.com/pdfjs-dist@${PDFJS_WORKER_VERSION}/build/pdf.worker.min.mjs`
