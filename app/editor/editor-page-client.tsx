"use client"

import dynamic from "next/dynamic"

const PDFEditor = dynamic(() => import("@/components/pdf-editor").then((mod) => ({ default: mod.PDFEditor })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
})

export default function EditorPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <PDFEditor />
    </main>
  )
}
