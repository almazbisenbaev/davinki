import type { Metadata } from "next"
import RotatePageClient from "./rotate-page-client"

export const metadata: Metadata = {
  title: "Rotate PDF Pages - Change PDF Orientation Online Free",
  description:
    "Rotate PDF pages to the correct orientation. Rotate individual pages or entire documents by 90, 180, or 270 degrees.",
  openGraph: {
    title: "Rotate PDF Pages - Da Vinki PDF",
    description: "Rotate PDF pages to the correct orientation for free.",
  },
}

export default function RotatePage() {
  return <RotatePageClient />
}
