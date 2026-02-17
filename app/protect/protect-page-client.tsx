"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const ProtectPDF = dynamic(
  () => import("@/components/tools/protect-pdf").then((mod) => ({ default: mod.ProtectPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function ProtectPageClient() {
  return (
    <ToolLayout title="Protect PDF" description="Add password protection to secure your PDF">
      <ProtectPDF />
    </ToolLayout>
  )
}
