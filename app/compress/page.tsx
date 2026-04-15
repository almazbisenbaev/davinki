import type { Metadata } from "next"
import { Minimize2 } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import CompressPageClient from "./compress-page-client"

export const metadata: Metadata = {
  title: "Compress PDF - Reduce PDF File Size Online Free",
  description: "Compress PDF files to reduce size while maintaining quality. Fast and free PDF compression tool.",
  openGraph: {
    title: "Compress PDF - Da Vinki PDF",
    description: "Reduce PDF file size while maintaining quality for free.",
  },
}

export default function CompressPage() {
  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      icon={<Minimize2 className="h-5 w-5 text-primary" />}
    >
      <CompressPageClient />
    </ToolLayout>
  )
}
