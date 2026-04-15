import type { Metadata } from "next"
import { Lock } from "lucide-react"
import { ToolLayout } from "@/components/tools/tool-layout"
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
  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection to secure your PDF"
      icon={<Lock className="h-5 w-5 text-primary" />}
    >
      <ProtectPageClient />
    </ToolLayout>
  )
}
