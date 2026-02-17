import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://davinkipdf.com"),
  title: {
    default: "Da Vinki PDF - Free Online PDF Tools",
    template: "%s | Da Vinki PDF",
  },
  description:
    "Free online PDF tools by Da Vinki. Edit, split, merge, compress, rotate, extract images, convert PDFs, and more. No registration required, works offline.",
  keywords: [
    "PDF editor",
    "PDF tools",
    "split PDF",
    "merge PDF",
    "compress PDF",
    "convert PDF",
    "PDF to image",
    "extract PDF images",
    "rotate PDF",
    "PDF watermark",
    "secure PDF",
    "free PDF tools",
    "online PDF editor",
  ],
  authors: [{ name: "Da Vinki PDF" }],
  creator: "Da Vinki PDF",
  publisher: "Da Vinki PDF",
  generator: "v0.app",
  applicationName: "Da Vinki PDF",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://davinkipdf.com",
    title: "Da Vinki PDF - Free Online PDF Tools",
    description:
      "Free online PDF tools. Edit, split, merge, compress, and convert PDFs with ease. No registration required.",
    siteName: "Da Vinki PDF",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Da Vinki PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Da Vinki PDF - Free Online PDF Tools",
    description: "Free online PDF tools. Edit, split, merge, compress, and convert PDFs with ease.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
