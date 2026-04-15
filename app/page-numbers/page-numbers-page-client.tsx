"use client"

import dynamic from "next/dynamic"

const PageNumbersTool = dynamic(
  () => import("@/components/tools/page-numbers").then((mod) => ({ default: mod.PageNumbersTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function PageNumbersPageClient() {
  return <PageNumbersTool />
}
