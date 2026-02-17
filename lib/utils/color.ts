/**
 * Color utility functions for PDF operations
 */

/**
 * Converts a hex color string to RGB values (0-1 range)
 * @param hex - The hex color string (e.g., "#ff0000")
 * @returns RGB object with r, g, b values in 0-1 range
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16) / 255,
        g: Number.parseInt(result[2], 16) / 255,
        b: Number.parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Converts RGB values (0-1 range) to hex color string
 * @param r - Red value (0-1)
 * @param g - Green value (0-1)
 * @param b - Blue value (0-1)
 * @returns Hex color string (e.g., "#ff0000")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
