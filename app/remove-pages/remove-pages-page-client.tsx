"use client"

import dynamic from "next/dynamic"

const RemovePagesTool = dynamic(
  () => import("@/components/tools/remove-pages").then((mod) => ({ default: mod.RemovePagesTool })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
  },
)

export default function RemovePagesPageClient() {
  return <RemovePagesTool />
}
