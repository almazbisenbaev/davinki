"use client"

import dynamic from "next/dynamic"

const ExtractImages = dynamic(
  () => import("@/components/tools/extract-images").then((mod) => ({ default: mod.ExtractImages })),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
  },
)

export default function ExtractImagesPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <ExtractImages />
    </main>
  )
}
