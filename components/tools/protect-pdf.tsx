import { Card } from "@/components/ui/card"
import { Lock, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProtectPDF() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-strong border-2 p-8">
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="p-4 bg-muted rounded-2xl">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">PDF Password Protection</h2>
            <p className="text-muted-foreground max-w-md">
              This tool is currently under development. PDF encryption requires server-side processing to properly secure your documents.
            </p>
          </div>
          <Alert className="max-w-md text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Coming soon</AlertTitle>
            <AlertDescription>
              We are working on implementing proper AES-256 encryption for PDF protection. Check back soon for updates.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  )
}
