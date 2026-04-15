"use client"

import dynamic from "next/dynamic"

const RotatePDF = dynamic(() => import("@/components/tools/rotate-pdf").then((mod) => ({ default: mod.RotatePDF })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
})

export default function RotatePageClient() {
  return <RotatePDF />
}
