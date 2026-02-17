/**
 * Text processing utilities for PDF operations
 */

/**
 * Checks if text contains non-Latin characters
 * @param text - The text to check
 * @returns True if text contains non-Latin characters
 */
export function containsNonLatinChars(text: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /[^\u0000-\u007F]/.test(text)
}

/**
 * Sanitizes text by converting Cyrillic characters to Latin equivalents
 * Used as fallback when Unicode fonts are not available
 * @param text - The text to sanitize
 * @returns Sanitized text with Latin characters
 */
export function sanitizeForWinAnsi(text: string): string {
  const cyrillicToLatin: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "E",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "H",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  }

  return text.replace(/[а-яА-ЯёЁ]/g, (char) => cyrillicToLatin[char] || char).replace(/[^\x00-\xFF]/g, "?")
}
