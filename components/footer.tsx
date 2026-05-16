import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t glass-strong mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-base text-muted-foreground max-w-md">
            Free online PDF tools for editing, converting, and managing PDF documents — no registration required, works entirely in your browser.
          </p>
          <p className="text-base text-muted-foreground">
            Built by{" "}
            <Link
              href="https://helloalmaz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-semibold hover:text-primary transition-colors"
            >
              Almaz Bissenbayev
            </Link>
          </p>
          <p className="text-sm text-muted-foreground/70">
            © {new Date().getFullYear()} davinki.vercel.app. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
