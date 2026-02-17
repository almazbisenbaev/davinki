"use client"

import dynamic from "next/dynamic"

const MergePDF = dynamic(() => import("@/components/tools/merge-pdf").then((mod) => ({ default: mod.MergePDF })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>,
})

export default function MergePageClient() {
  return (
    <main className="min-h-screen bg-background">
      <MergePDF />
    </main>
  )
}
