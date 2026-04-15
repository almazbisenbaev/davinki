"use client"

import dynamic from "next/dynamic"
import { GripVertical } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"

const ReorderPagesTool = dynamic(
  () => import("@/components/tools/reorder-pages").then((mod) => ({ default: mod.ReorderPagesTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function ReorderPageClient() {
  return (
    <ToolLayout
      title="Reorder Pages"
      description="Drag and drop to rearrange the pages in your PDF"
      icon={<GripVertical className="h-5 w-5 text-primary" />}
    >
      <ReorderPagesTool />
    </ToolLayout>
  )
}
