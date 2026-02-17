"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="relative w-full border-b glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">Da Vinki PDF</span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm",
                    pathname === link.href && "bg-primary/10 text-primary"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-3 py-2 rounded-lg transition-colors text-sm",
                          pathname === link.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-primary/10"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
