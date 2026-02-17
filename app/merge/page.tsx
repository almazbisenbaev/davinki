import type { Metadata } from "next"
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
  return <MergePageClient />
}
