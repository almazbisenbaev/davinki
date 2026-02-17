/**
 * Formatting utility functions
 */

/**
 * Formats bytes into human-readable file size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.5 MB"
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Formats a number as a percentage
 * @param value - The value to format
 * @param total - The total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "75%"
 */
export function formatPercentage(value: number, total: number, decimals = 0): string {
  if (total === 0) return "0%"
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Truncates a string to specified length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}
