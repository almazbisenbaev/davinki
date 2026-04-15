"use client"

import dynamic from "next/dynamic"
import { Hash } from "lucide-react"
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
      icon={<Hash className="h-5 w-5 text-primary" />}
    >
      <PageNumbersTool />
    </ToolLayout>
  )
}
