import type { Metadata } from "next"
import RemovePagesPageClient from "./remove-pages-page-client"

export const metadata: Metadata = {
  title: "Remove PDF Pages - Delete Pages from PDF Online Free",
  description: "Delete specific pages from your PDF documents. Easy page removal tool for PDFs.",
  openGraph: {
    title: "Remove PDF Pages - Da Vinki PDF",
    description: "Delete specific pages from your PDF for free.",
  },
}

export default function RemovePagesPage() {
  return <RemovePagesPageClient />
}
