import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Scissors, Combine, Minimize2, RotateCw, ImageIcon, Droplet, Lock, FileType, Trash2, GripVertical, Hash, PenTool, Crop, Layers, EyeOff, ScanSearch, GitCompareArrows, Palette, LockOpen } from "lucide-react"
import { JsonLd } from "@/components/seo/json-ld"

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Da Vinki PDF",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    operatingSystem: "Web Browser",
    description: "Free online PDF tools for editing, converting, and managing PDF documents",
    featureList:
      "PDF Editor, Split PDF, Merge PDFs, Compress PDF, Rotate Pages, Extract Images, Extract Text, Add Watermark, Protect PDF, Convert PDF, Remove Pages, Reorder Pages, Add Page Numbers, Add Signature",
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://davinkipdf.com",
      },
    ],
  }

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance">
                <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Da Vinki PDF
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                Complete toolkit for editing, converting, and managing PDF documents
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                href="/editor"
                name="PDF Editor"
                description="Edit text, add annotations, draw, and insert images"
                Icon={FileText}
                badge="Beta"
                delay={200}
              />
              <ToolCard
                href="/split"
                name="Split PDF"
                description="Split a PDF into separate pages or ranges"
                Icon={Scissors}
                delay={250}
              />
              <ToolCard
                href="/merge"
                name="Merge PDFs"
                description="Combine multiple PDF files into one document"
                Icon={Combine}
                delay={300}
              />
              <ToolCard
                href="/compress"
                name="Compress PDF"
                description="Reduce PDF file size while maintaining quality"
                Icon={Minimize2}
                badge="Beta"
                delay={350}
              />
              <ToolCard
                href="/rotate"
                name="Rotate Pages"
                description="Rotate PDF pages to the correct orientation"
                Icon={RotateCw}
                badge="Beta"
                delay={400}
              />
              <ToolCard
                href="/extract-images"
                name="Extract Images"
                description="Extract all images from a PDF document"
                Icon={ImageIcon}
                badge="Beta"
                delay={450}
              />
              <ToolCard
                href="/extract-text"
                name="Extract Text"
                description="Extract all text content from a PDF document"
                Icon={FileText}
                badge="Beta"
                delay={500}
              />
              <ToolCard
                href="/watermark"
                name="Add Watermark"
                description="Add text or image watermarks to your PDF"
                Icon={Droplet}
                badge="Beta"
                delay={550}
              />
              <ToolCard
                href="/protect"
                name="Protect PDF"
                description="Add password protection to secure your PDF"
                Icon={Lock}
                badge="Beta"
                delay={600}
              />
              <ToolCard
                href="/convert"
                name="Convert PDF"
                description="Convert PDF pages to images (PNG, JPG)"
                Icon={FileType}
                badge="Beta"
                delay={650}
              />
              <ToolCard
                href="/remove-pages"
                name="Remove Pages"
                description="Delete specific pages from your PDF"
                Icon={Trash2}
                badge="Beta"
                delay={700}
              />
              <ToolCard
                href="/reorder"
                name="Reorder Pages"
                description="Drag and drop to rearrange PDF pages"
                Icon={GripVertical}
                badge="Beta"
                delay={750}
              />
              <ToolCard
                href="/page-numbers"
                name="Add Page Numbers"
                description="Add custom page numbers with various styles"
                Icon={Hash}
                badge="Beta"
                delay={800}
              />
              <ToolCard
                href="/signature"
                name="Add Signature"
                description="Draw or upload your signature to PDF"
                Icon={PenTool}
                badge="Beta"
                delay={850}
              />
            </div>
            <div className="mt-20">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">New tools we are working on</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ComingSoonToolCard
                  name="Crop PDF"
                  description="Trim margins and whitespace from PDF pages"
                  Icon={Crop}
                  delay={600}
                />
                <ComingSoonToolCard
                  name="Flatten PDF"
                  description="Flatten form fields and annotations into static content"
                  Icon={Layers}
                  delay={650}
                />
                <ComingSoonToolCard
                  name="Redact PDF"
                  description="Permanently black out sensitive information in documents"
                  Icon={EyeOff}
                  delay={700}
                />
                <ComingSoonToolCard
                  name="OCR PDF"
                  description="Make scanned or image-based PDFs searchable with text recognition"
                  Icon={ScanSearch}
                  delay={750}
                />
                <ComingSoonToolCard
                  name="Compare PDFs"
                  description="Visual side-by-side diff to spot changes between two documents"
                  Icon={GitCompareArrows}
                  delay={800}
                />
                <ComingSoonToolCard
                  name="Grayscale PDF"
                  description="Convert color pages to black and white for printing"
                  Icon={Palette}
                  delay={850}
                />
                <ComingSoonToolCard
                  name="Unlock PDF"
                  description="Remove password restrictions from protected PDF files"
                  Icon={LockOpen}
                  delay={900}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

type ToolCardProps = {
  href: string
  name: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
  delay: number
}

function ToolCard({ href, name, description, Icon, badge, delay }: ToolCardProps) {

  return (
    <Link href={href} className="group animate-in fade-in slide-in-from-bottom-8 duration-700 block" style={{ animationDelay: `${delay}ms` }}>
      <Card className="h-full glass-strong border-2 transition-all duration-300 hover:border-primary/50 cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl transition-all duration-300 border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                  {name}
                </CardTitle>
                {badge && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {badge}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              <div className="mt-3 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                Use this tool <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

type ComingSoonToolCardProps = {
  name: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  delay: number
}

function ComingSoonToolCard({ name, description, Icon, delay }: ComingSoonToolCardProps) {

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-8 duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="h-full border-2 border-dashed border-border/60 bg-muted/30 overflow-hidden relative">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-xl border border-border/40">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg text-muted-foreground">
                  {name}
                </CardTitle>
                <Badge variant="outline" className="text-xs px-2 py-0 text-muted-foreground border-muted-foreground/30">
                  Soon
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
