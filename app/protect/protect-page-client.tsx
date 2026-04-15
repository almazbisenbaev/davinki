"use client"

import dynamic from "next/dynamic"

const ProtectPDF = dynamic(
  () => import("@/components/tools/protect-pdf").then((mod) => ({ default: mod.ProtectPDF })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function ProtectPageClient() {
  return <ProtectPDF />
}
