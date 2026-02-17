import type { MetadataRoute } from "next"

/**
 * Generates robots.txt for search engine crawlers
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://davinkipdf.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
