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
      <DialogContent className="bg-white border-none max-w-md shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-slate-900">Ready to Download!</DialogTitle>
            <DialogDescription className="text-center text-slate-500 text-base">{description}</DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{fileName}</p>
                {fileSize && <p className="text-xs text-slate-500 font-medium">File size: {fileSize}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleDownload} 
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="w-full h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
