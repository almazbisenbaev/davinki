import type { Metadata } from "next"
import EditorPageClient from "./editor-page-client"

export const metadata: Metadata = {
  title: "PDF Editor - Edit PDF Text, Annotate & Draw Online Free",
  description:
    "Powerful online PDF editor. Edit text, add annotations, draw, highlight, and insert images into your PDFs.",
  openGraph: {
    title: "PDF Editor - Da Vinki PDF",
    description: "Edit PDF files online with powerful annotation and drawing tools.",
  },
}

export default function EditorPage() {
  return <EditorPageClient />
}
