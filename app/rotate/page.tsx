import type { Metadata } from "next"
import { RotateCw } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import RotatePageClient from "./rotate-page-client"

export const metadata: Metadata = {
  title: "Rotate PDF Pages - Change PDF Orientation Online Free",
  description:
    "Rotate PDF pages to the correct orientation. Rotate individual pages or entire documents by 90, 180, or 270 degrees.",
  openGraph: {
    title: "Rotate PDF Pages - Da Vinki PDF",
    description: "Rotate PDF pages to the correct orientation for free.",
  },
}

export default function RotatePage() {
  return (
    <ToolLayout
      title="Rotate Pages"
      description="Rotate PDF pages to the correct orientation"
      icon={<RotateCw className="h-5 w-5 text-primary" />}
    >
      <RotatePageClient />
    </ToolLayout>
  )
}
