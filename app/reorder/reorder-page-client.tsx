"use client"

import dynamic from "next/dynamic"

const ReorderPagesTool = dynamic(
  () => import("@/components/tools/reorder-pages").then((mod) => ({ default: mod.ReorderPagesTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function ReorderPageClient() {
  return <ReorderPagesTool />
}
