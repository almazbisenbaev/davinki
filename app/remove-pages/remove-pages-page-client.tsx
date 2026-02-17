"use client"

import dynamic from "next/dynamic"
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
    <ToolLayout title="Remove Pages" description="Delete specific pages from your PDF document">
      <RemovePagesTool />
    </ToolLayout>
  )
}
