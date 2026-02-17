/**
 * JSON-LD Structured Data Component
 * Helps search engines understand the content and context
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
