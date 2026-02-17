"use client"

import { useState, useCallback } from "react"
import { validatePdfFile } from "@/lib/utils/validation"
import { getErrorMessage } from "@/lib/utils/error"

/**
 * Custom hook for managing PDF file state and validation
 * @returns File state and handlers
 */
export function usePdfFile() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setError("")

    if (!selectedFile) {
      setFile(null)
      return
    }

    const validationError = validatePdfFile(selectedFile)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }

    setFile(selectedFile)
  }, [])

  const reset = useCallback(() => {
    setFile(null)
    setError("")
    setLoading(false)
  }, [])

  const setErrorMessage = useCallback((err: unknown) => {
    setError(getErrorMessage(err))
  }, [])

  return {
    file,
    error,
    loading,
    setFile: handleFileSelect,
    setError: setErrorMessage,
    setLoading,
    reset,
  }
}
