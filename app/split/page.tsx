import type { Metadata } from "next"
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
  return <SplitPageClient />
}
