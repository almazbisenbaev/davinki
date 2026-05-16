import type { Metadata } from "next"
import { X } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me on Twitter for any questions or feedback.",
}

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-foreground">
            Contact
          </h1>
          <p className="text-lg text-muted-foreground text-balance mb-8 leading-relaxed">
            Have questions, feedback, or just want to say hi? Reach out to me on Twitter.
          </p>
          
          <a
            href="https://twitter.com/almazbisenbaev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <X className="h-5 w-5" />
            @almazbisenbaev
          </a>
        </div>
      </div>
    </main>
  )
}
