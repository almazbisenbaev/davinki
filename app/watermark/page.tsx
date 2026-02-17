import type { Metadata } from "next"
import WatermarkPageClient from "./watermark-page-client"

export const metadata: Metadata = {
  title: "Add Watermark to PDF - Text & Image Watermarks Online Free",
  description: "Add custom text or image watermarks to your PDF documents. Protect and brand your PDFs easily.",
  openGraph: {
    title: "Add Watermark to PDF - Da Vinki PDF",
    description: "Add text or image watermarks to your PDF for free.",
  },
}

export default function WatermarkPage() {
  return <WatermarkPageClient />
}
