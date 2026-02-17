"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const PageNumbersTool = dynamic(
  () => import("@/components/tools/page-numbers").then((mod) => ({ default: mod.PageNumbersTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function PageNumbersPageClient() {
  return (
    <ToolLayout
      title="Add Page Numbers"
      description="Add custom page numbers to your PDF with various styles and positions"
    >
      <PageNumbersTool />
    </ToolLayout>
  )
}
