import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import type { TextAnnotation, DrawingAnnotation, ImageAnnotation, TextEdit } from "./pdf-types"
import { hexToRgb } from "./utils/color"
import { containsNonLatinChars, sanitizeForWinAnsi } from "./utils/text"
import { downloadPdfBytes } from "./utils/download"

const FONT_URLS = {
  regular: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
  bold: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2",
}

// Cache fonts
const fontCache: Record<string, ArrayBuffer> = {}

async function loadFontFromCache(style: "regular" | "bold" = "regular"): Promise<ArrayBuffer> {
  const cacheKey = style
  if (fontCache[cacheKey]) return fontCache[cacheKey]

  try {
    const url = FONT_URLS[style]
    const response = await fetch(url)
    if (response.ok) {
      fontCache[cacheKey] = await response.arrayBuffer()
      return fontCache[cacheKey]
    }
  } catch (e) {
    console.warn(`Failed to load ${style} font, trying fallback`)
  }

  // Fallback to Roboto
  const response = await fetch("https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2")
  fontCache[cacheKey] = await response.arrayBuffer()
  return fontCache[cacheKey]
}

/**
 * Renders text edits to a PDF page
 */
async function renderTextEdits(
  page: PDFPage,
  edits: TextEdit[],
  pageNumber: number,
  fonts: Record<string, PDFFont>,
  scale: number,
  needsUnicode: boolean,
) {
  const pageEdits = edits.filter((e) => e.page === pageNumber)

  for (const edit of pageEdits) {
    if (edit.newText === edit.originalText && !edit.bold && !edit.italic && !edit.underline) continue

    const pdfX = edit.pdfX
    const fontSizeRatio = edit.fontSize / (edit.pdfFontSize * scale)
    const actualPdfFontSize = edit.pdfFontSize * fontSizeRatio
    const pdfY = edit.pdfY - actualPdfFontSize

    // Cover original text with white rectangle
    page.drawRectangle({
      x: pdfX - 2,
      y: edit.pdfY - edit.pdfFontSize - 2,
      width: edit.pdfWidth + 4,
      height: edit.pdfFontSize + 4,
      color: rgb(1, 1, 1),
    })

    const color = hexToRgb(edit.color)
    const textToRender = needsUnicode ? edit.newText : sanitizeForWinAnsi(edit.newText)
    const font = edit.bold ? fonts.bold : fonts.regular

    page.drawText(textToRender, {
      x: pdfX,
      y: pdfY,
      size: actualPdfFontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    })

    if (edit.underline) {
      const textWidth = font.widthOfTextAtSize(textToRender, actualPdfFontSize)
      page.drawLine({
        start: { x: pdfX, y: pdfY - 2 },
        end: { x: pdfX + textWidth, y: pdfY - 2 },
        thickness: 1,
        color: rgb(color.r, color.g, color.b),
      })
    }
  }
}

/**
 * Renders text annotations to a PDF page
 */
function renderTextAnnotations(
  page: PDFPage,
  annotations: TextAnnotation[],
  pageNumber: number,
  fonts: Record<string, PDFFont>,
  scale: number,
  needsUnicode: boolean,
) {
  const { height } = page.getSize()
  const pageAnnotations = annotations.filter((a) => a.page === pageNumber)

  for (const annotation of pageAnnotations) {
    const color = hexToRgb(annotation.color)
    const textToRender = needsUnicode ? annotation.text : sanitizeForWinAnsi(annotation.text)
    const font = annotation.bold ? fonts.bold : fonts.regular
    const fontSize = annotation.fontSize / scale

    page.drawText(textToRender, {
      x: annotation.x / scale,
      y: height - annotation.y / scale - fontSize,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    })

    if (annotation.underline) {
      const textWidth = font.widthOfTextAtSize(textToRender, fontSize)
      page.drawLine({
        start: { x: annotation.x / scale, y: height - annotation.y / scale - fontSize - 2 },
        end: { x: annotation.x / scale + textWidth, y: height - annotation.y / scale - fontSize - 2 },
        thickness: 1,
        color: rgb(color.r, color.g, color.b),
      })
    }
  }
}

/**
 * Renders drawing annotations to a PDF page
 */
function renderDrawingAnnotations(page: PDFPage, annotations: DrawingAnnotation[], pageNumber: number, scale: number) {
  const { height } = page.getSize()
  const pageAnnotations = annotations.filter((a) => a.page === pageNumber)

  for (const annotation of pageAnnotations) {
    const color = hexToRgb(annotation.color)

    for (let i = 1; i < annotation.points.length; i++) {
      const start = annotation.points[i - 1]
      const end = annotation.points[i]

      page.drawLine({
        start: { x: start.x / scale, y: height - start.y / scale },
        end: { x: end.x / scale, y: height - end.y / scale },
        thickness: annotation.strokeWidth / scale,
        color: rgb(color.r, color.g, color.b),
        opacity: annotation.type === "highlight" ? 0.3 : 1,
      })
    }
  }
}

/**
 * Renders image annotations to a PDF page
 */
async function renderImageAnnotations(
  page: PDFPage,
  pdfDoc: PDFDocument,
  annotations: ImageAnnotation[],
  pageNumber: number,
  scale: number,
) {
  const { height } = page.getSize()
  const pageAnnotations = annotations.filter((a) => a.page === pageNumber)

  for (const annotation of pageAnnotations) {
    try {
      let image
      const base64 = annotation.src.split(",")[1]

      if (annotation.src.includes("data:image/png")) {
        image = await pdfDoc.embedPng(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
      } else if (annotation.src.includes("data:image/jpeg") || annotation.src.includes("data:image/jpg")) {
        image = await pdfDoc.embedJpg(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
      } else {
        continue
      }

      page.drawImage(image, {
        x: annotation.x / scale,
        y: height - annotation.y / scale - annotation.height / scale,
        width: annotation.width / scale,
        height: annotation.height / scale,
      })
    } catch (error) {
      console.error("Failed to embed image:", error)
    }
  }
}

/**
 * Downloads a PDF with annotations and edits applied
 * @param originalPdfData - Original PDF as ArrayBuffer
 * @param textAnnotations - Text annotations to add
 * @param drawingAnnotations - Drawing annotations to add
 * @param imageAnnotations - Image annotations to add
 * @param textEdits - Text edits to apply
 * @param fileName - Name for the downloaded file
 */
export async function downloadPDF(
  originalPdfData: ArrayBuffer,
  textAnnotations: TextAnnotation[],
  drawingAnnotations: DrawingAnnotation[],
  imageAnnotations: ImageAnnotation[],
  textEdits: TextEdit[],
  fileName: string,
) {
  const pdfDoc = await PDFDocument.load(originalPdfData)
  const pages = pdfDoc.getPages()
  const scale = 1.5

  // Check if we need Unicode support
  const allTexts = [...textEdits.map((e) => e.newText), ...textAnnotations.map((a) => a.text)]
  const needsUnicode = allTexts.some(containsNonLatinChars)

  // Load fonts
  const fonts: Record<string, PDFFont> = {}

  // Only try custom fonts if Unicode is absolutely required
  if (needsUnicode) {
    pdfDoc.registerFontkit(fontkit)
    try {
      const [regularData, boldData] = await Promise.all([loadFontFromCache("regular"), loadFontFromCache("bold")])
      fonts.regular = await pdfDoc.embedFont(regularData)
      fonts.bold = await pdfDoc.embedFont(boldData)
    } catch (error) {
      console.warn("Failed to embed custom fonts, falling back to standard fonts", error)
      // Fall back to standard fonts
      fonts.regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
      fonts.bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    }
  } else {
    fonts.regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    fonts.bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  }

  // Render all annotations and edits to each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const pageNumber = i + 1

    await renderTextEdits(page, textEdits, pageNumber, fonts, scale, needsUnicode)
    renderTextAnnotations(page, textAnnotations, pageNumber, fonts, scale, needsUnicode)
    renderDrawingAnnotations(page, drawingAnnotations, pageNumber, scale)
    await renderImageAnnotations(page, pdfDoc, imageAnnotations, pageNumber, scale)
  }

  const pdfBytes = await pdfDoc.save()
  const downloadFileName = fileName.replace(".pdf", "_edited.pdf")
  downloadPdfBytes(pdfBytes, downloadFileName)
}
