import type { MetadataRoute } from "next"

/**
 * Web app manifest for PWA support
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Da Vinki PDF - Free Online PDF Tools",
    short_name: "Da Vinki PDF",
    description: "Free online PDF tools. Edit, split, merge, compress, and convert PDFs.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef4444",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["productivity", "utilities"],
  }
}
