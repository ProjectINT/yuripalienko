import type { Locale } from './i18n'
import type { PricingContent, WorksContent } from '@/types/content'
import { SITE_URL, SITE_NAME, urlFor } from './seo'
import { getCv, getSite } from './content'

const ORG_ID = `${SITE_URL}/#organization`
const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

// Q6 открыт: дополнить LinkedIn, X, npm-пакетами, когда владелец пришлёт URL.
// Двусторонняя связка: эти профили должны ссылаться на palisoft.ru (Этап 5).
const SAME_AS = [
  'https://github.com/ProjectINT',
  'https://t.me/yurapalienko',
  'https://dev.to/yuri_palienko',
  'https://vc.ru/id6038291',
]

/**
 * Q2: корневая сущность — Organization (ИП как бизнес), Person привязан через
 * founder/employee. Даёт обе панели: бренд студии и персональный профиль.
 */
export function rootGraph(lang: Locale) {
  const site = getSite(lang)
  const cv = getCv(lang)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': ORG_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: site.description,
        founder: { '@id': PERSON_ID },
        employee: { '@id': PERSON_ID },
        areaServed: { '@type': 'Place', name: 'Worldwide' }, // Q3
        availableLanguage: ['en', 'ru'],
        priceRange: '$250–$6000+', // Q4
        sameAs: SAME_AS,
      },
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: site.name,
        jobTitle: site.role,
        url: urlFor(lang, '/cv'),
        worksFor: { '@id': ORG_ID },
        knowsAbout: cv.stack.flatMap((group) => group.items),
        knowsLanguage: ['ru', 'en'],
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: lang,
        publisher: { '@id': ORG_ID },
      },
    ],
  }
}

/** Хлебные крошки в выдаче вместо голого URL; сайт двухуровневый */
export function breadcrumbs(lang: Locale, path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ru' ? 'Главная' : 'Home',
        item: urlFor(lang),
      },
      { '@type': 'ListItem', position: 2, name, item: urlFor(lang, path) },
    ],
  }
}

export function worksItemList(lang: Locale, works: WorksContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: works.title,
    itemListElement: works.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.title,
        description: item.summary,
        ...(item.url ? { url: item.url } : {}),
        keywords: item.stack.join(', '),
        creator: { '@id': ORG_ID },
      },
    })),
  }
}

/**
 * Q4: Offer с priceCurrency USD. Google редко показывает цены для Service
 * в сниппетах — разметка уточняет сущность и читается AI-ассистентами.
 */
export function pricingGraph(lang: Locale, pricing: PricingContent) {
  return {
    '@context': 'https://schema.org',
    '@graph': pricing.tiers.map((tier) => ({
      '@type': 'Service',
      name: tier.title,
      description: tier.summary,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      ...(tier.price !== null
        ? {
            offers: {
              '@type': 'Offer',
              price: tier.price,
              priceCurrency: tier.currency,
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
    })),
  }
}

export function profilePage(lang: Locale, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: urlFor(lang, path),
    inLanguage: lang,
    mainEntity: { '@id': PERSON_ID },
  }
}

export function contactPage(lang: Locale, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: urlFor(lang, path),
    inLanguage: lang,
    about: { '@id': ORG_ID },
  }
}
