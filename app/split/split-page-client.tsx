"use client"

import dynamic from "next/dynamic"

const SplitPDF = dynamic(() => import("@/components/tools/split-pdf").then((mod) => ({ default: mod.SplitPDF })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
})

export default function SplitPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <SplitPDF />
    </main>
  )
}
