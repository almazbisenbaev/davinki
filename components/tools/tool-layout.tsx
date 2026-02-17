import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ToolLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Shared layout wrapper for PDF tool pages
 * Provides consistent sub-header with back button and styling
 */
export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
