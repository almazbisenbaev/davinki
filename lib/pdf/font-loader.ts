/**
 * Font loading and caching utilities for PDF operations
 */

const FONT_URLS = {
  regular: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
  bold: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2",
  fallback: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2",
}

const fontCache: Record<string, ArrayBuffer> = {}

/**
 * Loads a font from Google Fonts with caching
 * @param style - The font style to load
 * @returns Promise resolving to the font data as ArrayBuffer
 */
export async function loadFont(style: "regular" | "bold" = "regular"): Promise<ArrayBuffer> {
  if (fontCache[style]) {
    return fontCache[style]
  }

  try {
    const url = FONT_URLS[style]
    const response = await fetch(url)
    if (response.ok) {
      fontCache[style] = await response.arrayBuffer()
      return fontCache[style]
    }
  } catch (error) {
    console.warn(`Failed to load ${style} font, using fallback`, error)
  }

  // Fallback to Roboto
  const response = await fetch(FONT_URLS.fallback)
  const fallbackFont = await response.arrayBuffer()
  fontCache[style] = fallbackFont
  return fallbackFont
}

/**
 * Clears the font cache
 */
export function clearFontCache(): void {
  Object.keys(fontCache).forEach((key) => delete fontCache[key])
}
