import type { Metadata } from "next"
import { Combine } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
import MergePageClient from "./merge-page-client"

export const metadata: Metadata = {
  title: "Merge PDFs - Combine Multiple PDF Files Online Free",
  description:
    "Combine multiple PDF files into one document. Merge PDFs in any order with optional page width equalization.",
  openGraph: {
    title: "Merge PDFs - Da Vinki PDF",
    description: "Combine multiple PDF files into one document for free.",
  },
}

export default function MergePage() {
  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into one"
      icon={<Combine className="h-5 w-5 text-primary" />}
    >
      <MergePageClient />
    </ToolLayout>
  )
}
