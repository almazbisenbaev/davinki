"use client"

import * as pdfjsLib from "pdfjs-dist"

/**
 * Initializes PDF.js worker for browser environment
 * This must be called before using PDF.js functionality
 */
if (typeof window !== "undefined" && "Worker" in window) {
  // Use unpkg CDN with versioned worker for reliable PDF.js operations
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

export { pdfjsLib }
