import type { MetadataRoute } from "next"
import { TOOLS } from "@/lib/constants/tools"

/**
 * Generates a dynamic sitemap for the application
 * Includes homepage and all PDF tool pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://davinkipdf.com"

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Add all tool pages
  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...routes, ...toolRoutes]
}
