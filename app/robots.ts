import type { MetadataRoute } from 'next'
import { SITE_URL, INDEXING_ENABLED } from '@/lib/seo'

// AI-краулеры разрешены осознанно: цитирование в AI-ответах — реальный канал
// входящих обращений для студии разработки.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    // Q5: всё закрыто, sitemap не публикуем — чтобы не приглашать обход
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/_next/', '/api/'] },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
