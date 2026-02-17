"use client"

import dynamic from "next/dynamic"

const ExtractText = dynamic(
  () => import("@/components/tools/extract-text").then((mod) => ({ default: mod.ExtractText })),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
  },
)

export default function ExtractTextPageClient() {
  return <ExtractText />
}
