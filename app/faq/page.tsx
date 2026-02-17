import type { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { JsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Da Vinki PDF. Learn about privacy, supported formats, file limits, and more.",
}

const faqs = [
  {
    question: "Is Da Vinki PDF really free?",
    answer:
      "Yes, completely. Every tool is free to use with no daily limits, no watermarks on output files, and no premium tier. We plan to keep it this way.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. All PDF processing happens directly in your browser using client-side JavaScript. Your files never leave your device. We have no server that receives, stores, or processes your documents.",
  },
  {
    question: "What is the maximum file size I can work with?",
    answer:
      "Since processing happens in your browser, the limit depends on your device's available memory. Most modern devices can handle files up to 100MB without issues. Very large files may be slower on older hardware.",
  },
  {
    question: "What browsers are supported?",
    answer:
      "Da Vinki PDF works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience.",
  },
  {
    question: "Can I use Da Vinki PDF offline?",
    answer:
      "Once the page is loaded, most tools will continue to work without an internet connection since all processing is done locally. However, you do need an initial connection to load the application.",
  },
  {
    question: "What PDF features are supported?",
    answer:
      "We support splitting, merging, compressing, rotating, converting to images, extracting text and images, adding watermarks, adding page numbers, reordering pages, removing pages, and basic PDF editing with annotations.",
  },
  {
    question: "Is there an API available?",
    answer:
      "Not currently. Da Vinki PDF is a browser-based tool designed for individual use. If you need programmatic PDF processing, we recommend libraries like pdf-lib or pdfjs-dist.",
  },
  {
    question: "I found a bug. How do I report it?",
    answer:
      "Please reach out through our Contact page with a description of the issue, the browser you are using, and the steps to reproduce the problem. We appreciate all feedback.",
  },
]

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <JsonLd data={faqSchema} />

      <main className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-foreground">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed">
                Common questions about Da Vinki PDF and how it works.
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: "100ms" }}>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="glass-strong border-2 rounded-lg px-6 data-[state=open]:border-primary/30 transition-colors duration-200"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
