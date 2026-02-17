import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { TOOLS, COMING_SOON_TOOLS } from "@/lib/constants/tools"
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
    featureList: TOOLS.map((tool) => tool.name).join(", "),
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
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group animate-in fade-in slide-in-from-bottom-8 duration-700 block"
                    style={{ animationDelay: `${index * 50 + 200}ms` }}
                  >
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
                                {tool.name}
                              </CardTitle>
                              {tool.badge && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  {tool.badge}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                            <div className="mt-3 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                              Use this tool <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
            {/* Coming Soon Section */}
            <div className="mt-20">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">New tools we are working on</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COMING_SOON_TOOLS.map((tool, index) => {
                  const Icon = tool.icon
                  return (
                    <div
                      key={tool.name}
                      className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                      style={{ animationDelay: `${index * 50 + 600}ms` }}
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
                                  {tool.name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs px-2 py-0 text-muted-foreground border-muted-foreground/30">
                                  Soon
                                </Badge>
                              </div>
                              <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
