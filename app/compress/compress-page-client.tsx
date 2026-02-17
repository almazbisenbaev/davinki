"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const CompressPDF = dynamic(
  () => import("@/components/tools/compress-pdf").then((mod) => ({ default: mod.CompressPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function CompressPageClient() {
  return (
    <ToolLayout title="Compress PDF" description="Reduce PDF file size while maintaining quality">
      <CompressPDF />
    </ToolLayout>
  )
}
