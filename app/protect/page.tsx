import type { Metadata } from "next"
import ProtectPageClient from "./protect-page-client"

export const metadata: Metadata = {
  title: "Protect PDF - Add Password Protection Online Free",
  description: "Secure your PDF files with password protection. Add encryption to prevent unauthorized access.",
  openGraph: {
    title: "Protect PDF - Da Vinki PDF",
    description: "Add password protection to secure your PDF files for free.",
  },
}

export default function ProtectPage() {
  return <ProtectPageClient />
}
