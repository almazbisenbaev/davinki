import type { Metadata } from "next"
import ExtractTextPageClient from "./extract-text-page-client"

export const metadata: Metadata = {
  title: "Extract Text from PDF - Copy PDF Text Content Online Free",
  description: "Extract all text content from PDF documents. Convert PDF to plain text format instantly.",
  openGraph: {
    title: "Extract Text from PDF - Da Vinki PDF",
    description: "Extract text content from PDF documents for free.",
  },
}

export default function ExtractTextPage() {
  return <ExtractTextPageClient />
}
