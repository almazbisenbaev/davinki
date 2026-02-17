import type { Metadata } from "next"
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
  return <ReorderPageClient />
}
