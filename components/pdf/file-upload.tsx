"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileUpload: (data: ArrayBuffer, name: string) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file")
        return
      }

      setError(null)
      setIsLoading(true)

      try {
        const arrayBuffer = await file.arrayBuffer()
        onFileUpload(arrayBuffer, file.name)
      } catch {
        setError("Failed to read the PDF file")
      } finally {
        setIsLoading(false)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">PDF Editor</h1>
          </div>
          <p className="text-lg text-muted-foreground">Upload, edit, and download PDFs online for free</p>
        </div>

        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
            ${isLoading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isDragActive ? "bg-primary/10" : "bg-muted"}`}>
              <Upload className={`h-8 w-8 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
              </p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
            </div>
            <Button variant="outline" disabled={isLoading}>
              {isLoading ? "Loading..." : "Select PDF"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <FeatureCard title="Add Text" description="Insert and edit text anywhere on your PDF" />
          <FeatureCard title="Draw & Annotate" description="Freehand drawing and highlighting tools" />
          <FeatureCard title="Add Images" description="Insert images and resize them as needed" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg bg-card border border-border">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
