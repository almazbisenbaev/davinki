import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageSquare, Bug } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Da Vinki PDF team. Report bugs, suggest features, or ask questions.",
}

const channels = [
  {
    icon: Bug,
    title: "Report a Bug",
    description:
      "Found something that does not work as expected? Let us know the tool name, your browser, and the steps to reproduce the issue.",
    action: "bugs@davinkipdf.com",
    label: "bugs@davinkipdf.com",
  },
  {
    icon: MessageSquare,
    title: "Feature Requests",
    description:
      "Have an idea for a new tool or an improvement to an existing one? We would love to hear your suggestions.",
    action: "features@davinkipdf.com",
    label: "features@davinkipdf.com",
  },
  {
    icon: Mail,
    title: "General Inquiries",
    description:
      "For anything else, including partnerships, press, or general questions about Da Vinki PDF.",
    action: "hello@davinkipdf.com",
    label: "hello@davinkipdf.com",
  },
]

export default function ContactPage() {
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
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed">
              We read every message. Reach out through the channel that fits best.
            </p>
          </div>

          <div className="grid gap-6">
            {channels.map((channel, index) => {
              const Icon = channel.icon
              return (
                <Card
                  key={channel.title}
                  className="glass-strong border-2 animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${index * 80 + 100}ms` }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold text-foreground mb-1">{channel.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {channel.description}
                        </p>
                        <a
                          href={`mailto:${channel.action}`}
                          className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                        >
                          {channel.label}
                        </a>
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
