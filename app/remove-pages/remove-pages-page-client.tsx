"use client"

import dynamic from "next/dynamic"
import { Trash2 } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"

const RemovePagesTool = dynamic(
  () => import("@/components/tools/remove-pages").then((mod) => ({ default: mod.RemovePagesTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function RemovePagesPageClient() {
  return (
    <ToolLayout
      title="Remove Pages"
      description="Delete specific pages from your PDF document"
      icon={<Trash2 className="h-5 w-5 text-primary" />}
    >
      <RemovePagesTool />
    </ToolLayout>
  )
}
