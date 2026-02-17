import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, Zap, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Da Vinki PDF, a free suite of browser-based PDF tools. No uploads, no registration, fully private.",
}

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All processing happens directly in your browser. Your files never leave your device and are never uploaded to any server.",
  },
  {
    icon: Zap,
    title: "Fast and Free",
    description:
      "Every tool is completely free to use with no hidden limits, watermarks, or premium tiers. Get results in seconds.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Use Da Vinki PDF on any modern browser, on any device. No software to install, no accounts to create.",
  },
  {
    icon: FileText,
    title: "Open Toolset",
    description:
      "From splitting and merging to watermarking and converting, we cover the PDF operations people actually need.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-foreground">
              About Da Vinki PDF
            </h1>
            <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed">
              A free, browser-based toolkit for working with PDF documents. No sign-ups, no uploads, no compromises.
            </p>
          </div>

          <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: "100ms" }}>
            <Card className="glass-strong border-2">
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-neutral max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    Da Vinki PDF was built out of frustration with existing online PDF tools that require sign-ups, impose daily limits, or quietly upload your private documents to remote servers. We believe working with PDFs should be simple, fast, and private.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Every tool in Da Vinki PDF runs entirely in your browser using modern web technologies. When you split a PDF or add a watermark, the processing happens on your machine. Nothing is sent over the network. Your documents stay yours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((item, index) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.title}
                  className="glass-strong border-2 animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${index * 80 + 200}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground mb-1">{item.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
