import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ToolLayoutProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}

export function ToolLayout({ title, description, icon, children }: ToolLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              {icon}
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{title}</h1>
              <p className="text-sm text-muted-foreground leading-tight">{description}</p>
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
