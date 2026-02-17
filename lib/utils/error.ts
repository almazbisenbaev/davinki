/**
 * Error handling utilities
 */

/**
 * Extracts a user-friendly error message from an error object
 * @param error - Error object or unknown error
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unexpected error occurred"
}

/**
 * Logs error to console with context
 * @param context - Context where error occurred
 * @param error - Error object
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}

/**
 * Common PDF operation errors
 */
export const PDF_ERRORS = {
  LOAD_FAILED: "Failed to load PDF. Please try again.",
  INVALID_FILE: "Invalid PDF file. Please select a valid PDF.",
  PROCESSING_FAILED: "Failed to process PDF. Please try again.",
  DOWNLOAD_FAILED: "Failed to download PDF. Please try again.",
  PERMISSION_DENIED: "This PDF is password protected or encrypted.",
  CORRUPTED_FILE: "The PDF file appears to be corrupted.",
  UNSUPPORTED_FEATURE: "This feature is not supported for this PDF.",
} as const

/**
 * Determines appropriate error message for PDF operations
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getPdfErrorMessage(error: unknown): string {
  const message = getErrorMessage(error)

  if (message.includes("password") || message.includes("encrypted")) {
    return PDF_ERRORS.PERMISSION_DENIED
  }

  if (message.includes("corrupted") || message.includes("invalid")) {
    return PDF_ERRORS.CORRUPTED_FILE
  }

  return PDF_ERRORS.PROCESSING_FAILED
}
