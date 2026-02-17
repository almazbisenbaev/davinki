import type { Metadata } from "next"
import SignaturePageClient from "./signature-page-client"

export const metadata: Metadata = {
  title: "Add Signature to PDF - Sign PDF Documents Online Free",
  description: "Draw or upload your signature and add it to PDF documents. Easy digital signature tool for PDFs.",
  openGraph: {
    title: "Add Signature to PDF - Da Vinki PDF",
    description: "Draw or upload your signature and add it to PDF for free.",
  },
}

export default function SignaturePage() {
  return <SignaturePageClient />
}
