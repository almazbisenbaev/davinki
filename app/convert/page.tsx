import type { Metadata } from "next"
import ConvertPageClient from "./convert-page-client"

export const metadata: Metadata = {
  title: "Convert PDF to Images - PDF to PNG, JPG Online Free",
  description: "Convert PDF pages to high-quality images. Export PDFs as PNG or JPG format for free.",
  openGraph: {
    title: "Convert PDF to Images - Da Vinki PDF",
    description: "Convert PDF pages to PNG or JPG images for free.",
  },
}

export default function ConvertPage() {
  return <ConvertPageClient />
}
