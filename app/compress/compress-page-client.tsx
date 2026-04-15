"use client"

import dynamic from "next/dynamic"

const CompressPDF = dynamic(
  () => import("@/components/tools/compress-pdf").then((mod) => ({ default: mod.CompressPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function CompressPageClient() {
  return <CompressPDF />
}
