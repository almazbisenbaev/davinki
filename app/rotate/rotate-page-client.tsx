"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const RotatePDF = dynamic(() => import("@/components/tools/rotate-pdf").then((mod) => ({ default: mod.RotatePDF })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
})

export default function RotatePageClient() {
  return (
    <ToolLayout title="Rotate Pages" description="Rotate PDF pages to the correct orientation">
      <RotatePDF />
    </ToolLayout>
  )
}
