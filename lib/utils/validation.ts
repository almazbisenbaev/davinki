/**
 * Validation utility functions for file and input handling
 */

import { MAX_PDF_FILE_SIZE, SUPPORTED_IMAGE_FORMATS } from "../constants/pdf"

/**
 * Validates if a file is a PDF
 * @param file - File to validate
 * @returns True if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

/**
 * Validates if a file size is within acceptable limits
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes (defaults to MAX_PDF_FILE_SIZE)
 * @returns True if file size is acceptable
 */
export function isFileSizeValid(file: File, maxSize: number = MAX_PDF_FILE_SIZE): boolean {
  return file.size <= maxSize
}

/**
 * Validates if an image format is supported
 * @param mimeType - MIME type to validate
 * @returns True if format is supported
 */
export function isImageFormatSupported(mimeType: string): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType as any)
}

/**
 * Validates PDF file and returns error message if invalid
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function validatePdfFile(file: File): string | null {
  if (!isPdfFile(file)) {
    return "Please select a valid PDF file"
  }

  if (!isFileSizeValid(file)) {
    return `File size exceeds maximum limit of ${MAX_PDF_FILE_SIZE / (1024 * 1024)}MB`
  }

  return null
}

/**
 * Validates page number input
 * @param pageNum - Page number to validate
 * @param totalPages - Total number of pages in document
 * @returns True if page number is valid
 */
export function isValidPageNumber(pageNum: number, totalPages: number): boolean {
  return Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= totalPages
}

/**
 * Validates page range string (e.g., "1-5,7,9-10")
 * @param rangeStr - Range string to validate
 * @param totalPages - Total number of pages
 * @returns True if range is valid
 */
export function isValidPageRange(rangeStr: string, totalPages: number): boolean {
  const ranges = rangeStr.split(",").map((r) => r.trim())

  for (const range of ranges) {
    if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number)
      if (!isValidPageNumber(start, totalPages) || !isValidPageNumber(end, totalPages) || start > end) {
        return false
      }
    } else {
      const pageNum = Number(range)
      if (!isValidPageNumber(pageNum, totalPages)) {
        return false
      }
    }
  }

  return true
}
