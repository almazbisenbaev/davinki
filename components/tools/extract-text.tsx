"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Copy, Check, Loader2, FileText } from "lucide-react"
import { ToolLayout } from "./tool-layout"
import { pdfjsLib } from "@/lib/pdf-worker"

export function ExtractText() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setExtractedText("")
    }
  }

  const handleExtract = async () => {
    if (!file) return

    setProcessing(true)
    setExtractedText("")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ""

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        const pageText = textContent.items.map((item: any) => item.str).join(" ")

        fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`
      }

      setExtractedText(fullText.trim())
    } catch (error) {
      console.error("Error extracting text:", error)
      setExtractedText("Error: Failed to extract text from PDF. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${file?.name.replace(".pdf", "")}_text.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="Extract Text" description="Extract all text content from a PDF document">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-strong border-2">
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Select a PDF file to extract text from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  file ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50 border-muted-foreground/30"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div
                    className={`p-4 rounded-2xl mb-3 transition-all duration-300 ${
                      file ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 transition-colors duration-300 ${
                        file ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="text-sm font-medium mb-1">{file ? file.name : "Click to upload PDF"}</p>
                  <p className="text-xs text-muted-foreground">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF files only"}
                  </p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {file && (
              <Button onClick={handleExtract} disabled={processing} className="w-full h-12 text-base font-medium">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting Text...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Extract Text
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {extractedText && (
          <Card className="glass-strong border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Text</CardTitle>
                  <CardDescription>
                    {extractedText.split("--- Page").length - 1} pages • {extractedText.length.toLocaleString()}{" "}
                    characters
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} size="sm" variant="outline" className="gap-2 bg-transparent">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={handleDownload} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <textarea
                  value={extractedText}
                  readOnly
                  className="w-full h-[500px] p-4 rounded-xl bg-muted/50 border-2 border-border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Extracted text will appear here..."
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
