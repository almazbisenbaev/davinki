"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const WatermarkPDF = dynamic(
  () => import("@/components/tools/watermark-pdf").then((mod) => ({ default: mod.WatermarkPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function WatermarkPageClient() {
  return (
    <ToolLayout title="Add Watermark" description="Add text or image watermarks to your PDF">
      <WatermarkPDF />
    </ToolLayout>
  )
}
