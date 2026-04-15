"use client"

import dynamic from "next/dynamic"

const WatermarkPDF = dynamic(
  () => import("@/components/tools/watermark-pdf").then((mod) => ({ default: mod.WatermarkPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function WatermarkPageClient() {
  return <WatermarkPDF />
}
