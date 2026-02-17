import type { Metadata } from "next"
import PageNumbersPageClient from "./page-numbers-page-client"

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF - Custom PDF Numbering Online Free",
  description:
    "Add custom page numbers to your PDF with various styles, positions, and formats. Easy PDF numbering tool.",
  openGraph: {
    title: "Add Page Numbers to PDF - Da Vinki PDF",
    description: "Add custom page numbers with various styles to your PDF for free.",
  },
}

export default function PageNumbersPage() {
  return <PageNumbersPageClient />
}
