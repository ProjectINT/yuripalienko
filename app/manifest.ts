import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Q9: бренд студии; Q3: start_url — английская локаль напрямую,
    // '/' срабатывал бы 307-редиректом при каждом запуске PWA
    name: 'Palisoft — SaaS, Marketplace & MVP Development',
    short_name: 'Palisoft',
    description:
      'Full-stack JavaScript development studio. Node.js / NestJS / React. SaaS platforms and marketplaces from scratch to production.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    icons: [
      {
        src: '/favicon/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
