import type { Metadata } from "next"
import ExtractImagesPageClient from "./extract-images-page-client"

export const metadata: Metadata = {
  title: "Extract Images from PDF - Download All PDF Images Online Free",
  description: "Extract all images from PDF documents in their original quality. Download images as PNG or JPG.",
  openGraph: {
    title: "Extract Images from PDF - Da Vinki PDF",
    description: "Extract all images from PDF documents for free.",
  },
}

export default function ExtractImagesPage() {
  return <ExtractImagesPageClient />
}
