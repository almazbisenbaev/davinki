import type { Metadata } from "next"
import { Droplet } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import WatermarkPageClient from "./watermark-page-client"

export const metadata: Metadata = {
  title: "Add Watermark to PDF - Text & Image Watermarks Online Free",
  description: "Add custom text or image watermarks to your PDF documents. Protect and brand your PDFs easily.",
  openGraph: {
    title: "Add Watermark to PDF - Da Vinki PDF",
    description: "Add text or image watermarks to your PDF for free.",
  },
}

export default function WatermarkPage() {
  return (
    <ToolLayout
      title="Add Watermark"
      description="Add text or image watermarks to your PDF"
      icon={<Droplet className="h-5 w-5 text-primary" />}
    >
      <WatermarkPageClient />
    </ToolLayout>
  )
}
