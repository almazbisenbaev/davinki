"use client"

import { Download, FileCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/**
 * Props for the DownloadModal component
 */
interface DownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
  fileName: string
  fileSize?: string
  description?: string
}

/**
 * Modal dialog shown before downloading a processed PDF file
 * Provides a confirmation step and displays file information
 */
export function DownloadModal({
  open,
  onOpenChange,
  onDownload,
  fileName,
  fileSize,
  description = "Your PDF is ready to download",
}: DownloadModalProps) {
  const handleDownload = () => {
    onDownload()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-2 max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto p-4 bg-primary/10 rounded-2xl animate-in zoom-in-50 duration-300">
            <FileCheck className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Ready to Download!</DialogTitle>
          <DialogDescription className="text-center text-base">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-muted/50 rounded-xl border">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">{fileName}</p>
                {fileSize && <p className="text-xs text-muted-foreground">File size: {fileSize}</p>}
              </div>
            </div>
          </div>

          <Button onClick={handleDownload} className="w-full h-12 text-base" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>

          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
