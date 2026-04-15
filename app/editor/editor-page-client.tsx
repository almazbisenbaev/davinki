"use client"

import dynamic from "next/dynamic"

const PDFEditor = dynamic(() => import("@/components/pdf-editor").then((mod) => ({ default: mod.PDFEditor })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
})

export default function EditorPageClient() {
  return <PDFEditor />
}
