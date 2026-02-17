"use client"

import dynamic from "next/dynamic"

const ConvertPDF = dynamic(
  () => import("@/components/tools/convert-pdf").then((mod) => ({ default: mod.ConvertPDF })),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
  },
)

export default function ConvertPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <ConvertPDF />
    </main>
  )
}
