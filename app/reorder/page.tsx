import type { Metadata } from "next"
import { GripVertical } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import ReorderPageClient from "./reorder-page-client"

export const metadata: Metadata = {
  title: "Reorder PDF Pages - Rearrange PDF Pages Online Free",
  description: "Drag and drop to reorder pages in your PDF. Easily rearrange PDF page order.",
  openGraph: {
    title: "Reorder PDF Pages - Da Vinki PDF",
    description: "Drag and drop to rearrange PDF pages for free.",
  },
}

export default function ReorderPage() {
  return (
    <ToolLayout
      title="Reorder Pages"
      description="Drag and drop to rearrange the pages in your PDF"
      icon={<GripVertical className="h-5 w-5 text-primary" />}
    >
      <ReorderPageClient />
    </ToolLayout>
  )
}
