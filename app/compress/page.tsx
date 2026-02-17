import type { Metadata } from "next"
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
  return <CompressPageClient />
}
