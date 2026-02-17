/**
 * Utility functions for downloading files
 */

/**
 * Downloads a Blob as a file with the specified filename
 * @param blob - The blob to download
 * @param filename - The name of the file to save
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Downloads PDF bytes as a file
 * @param pdfBytes - The PDF data as Uint8Array
 * @param filename - The name of the file to save
 */
export function downloadPdfBytes(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  downloadBlob(blob, filename)
}

/**
 * Downloads text content as a .txt file
 * @param text - The text content to download
 * @param filename - The name of the file to save
 */
export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain" })
  downloadBlob(blob, filename)
}

/**
 * Downloads an image from a data URL
 * @param dataUrl - The data URL of the image
 * @param filename - The name of the file to save
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
