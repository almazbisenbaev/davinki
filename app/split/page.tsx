import type { Metadata } from "next"
import { Scissors } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import SplitPageClient from "./split-page-client"

export const metadata: Metadata = {
  title: "Split PDF - Separate PDF Pages Online Free",
  description:
    "Split PDF files into separate pages or extract specific page ranges. Fast, secure, and free PDF splitting tool.",
  openGraph: {
    title: "Split PDF - Da Vinki PDF",
    description: "Split PDF files into separate pages or extract specific page ranges for free.",
  },
}

export default function SplitPage() {
  return (
    <ToolLayout
      title="Split PDF"
      description="Split your PDF into separate files"
      icon={<Scissors className="h-5 w-5 text-primary" />}
    >
      <SplitPageClient />
    </ToolLayout>
  )
}
