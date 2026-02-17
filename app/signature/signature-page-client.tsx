"use client"

import dynamic from "next/dynamic"
import { ToolLayout } from "@/components/tools/tool-layout"

const SignatureTool = dynamic(
  () => import("@/components/tools/signature").then((mod) => ({ default: mod.SignatureTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function SignaturePageClient() {
  return (
    <ToolLayout title="Add Signature" description="Draw or upload your signature and add it to your PDF">
      <SignatureTool />
    </ToolLayout>
  )
}
