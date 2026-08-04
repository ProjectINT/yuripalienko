import type { MetadataRoute } from 'next'

const BASE = 'https://yuripalienko.com' // TODO_CONFIRM домен

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
