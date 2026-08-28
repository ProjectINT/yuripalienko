import type { Locale } from './i18n'
import type {
  PalistorContent,
  Post,
  PricingContent,
  WorkItem,
  WorksContent,
} from '@/types/content'
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_LINKS, urlFor } from './seo'
import { getCv, getSite } from './content'

const ORG_ID = `${SITE_URL}/#organization`
const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`
const PALISTOR_ID = `${SITE_URL}/#palistor`

// Q6 закрыт: LinkedIn и X добавлены. Связка двусторонняя — эти профили должны
// ссылаться на palisoft.ru (см. §6 docs/seo-audit-2026-08-28.md).
const SAME_AS = [
  SOCIAL_LINKS.linkedin,
  SOCIAL_LINKS.x,
  SOCIAL_LINKS.github,
  SOCIAL_LINKS.telegram,
  SOCIAL_LINKS.devto,
  SOCIAL_LINKS.vcru,
  SOCIAL_LINKS.habr,
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
        image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
        logo: `${SITE_URL}/favicon/icon-512.png`,
        founder: { '@id': PERSON_ID },
        employee: { '@id': PERSON_ID },
        areaServed: { '@type': 'Place', name: 'Worldwide' }, // Q3
        availableLanguage: ['en', 'ru'],
        priceRange: lang === 'ru' ? 'от 500 000 ₽' : 'from $6000', // Q4
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

/**
 * Хлебные крошки в выдаче вместо голого URL. Сайт двухуровневый, кроме статей
 * и кейсов: им передаётся parent и получается Главная → Раздел → Страница.
 */
export function breadcrumbs(
  lang: Locale,
  path: string,
  name: string,
  parent?: { path: string; name: string },
) {
  const trail = [
    { name: lang === 'ru' ? 'Главная' : 'Home', item: urlFor(lang) },
    ...(parent ? [{ name: parent.name, item: urlFor(lang, parent.path) }] : []),
    { name, item: urlFor(lang, path) },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...step,
    })),
  }
}

/**
 * Разметка своей статьи. Автор и издатель — ссылками на @id из rootGraph:
 * статья становится ещё одним ребром графа к Person и Organization, а не
 * изолированной сущностью с продублированными именами.
 *
 * `image` обязателен для Article rich results. Своя обложка — приоритет;
 * без неё — статическая запасная OG-картинка (у неё стабильный URL, в
 * отличие от динамического OG-роута статьи с суффиксом id).
 */
export function blogPosting(lang: Locale, post: Post) {
  const url = urlFor(lang, `/articles/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.summary,
    inLanguage: lang,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    image: post.cover
      ? `${SITE_URL}${post.cover.src}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
  }
}

/** Ссылка на кейс: своя страница, если есть, иначе внешний сайт проекта */
function workUrl(lang: Locale, item: WorkItem) {
  if (item.page) return urlFor(lang, item.page)
  return item.url ?? undefined
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
        ...(workUrl(lang, item) ? { url: workUrl(lang, item) } : {}),
        keywords: item.stack.join(', '),
        creator: { '@id': ORG_ID },
      },
    })),
  }
}

/**
 * Страница кейса: WebPage + CreativeWork (сам проект). Скриншоты — ImageObject
 * с alt: это единственное место, где они существуют для Google Картинок вне
 * <canvas> hero-сцены.
 */
export function caseStudyGraph(lang: Locale, item: WorkItem, path: string) {
  const url = urlFor(lang, path)
  const workId = `${url}#work`
  const images = (item.images ?? []).map((image, index) => ({
    '@type': 'ImageObject',
    contentUrl: `${SITE_URL}${image.src}`,
    width: 1600,
    height: 900,
    name: `${item.title} — ${index + 1}`,
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: item.seoTitle ?? item.title,
        description: item.seoDescription ?? item.summary,
        inLanguage: lang,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': workId },
        mainEntity: { '@id': workId },
        ...(images.length > 0 ? { primaryImageOfPage: images[0].contentUrl } : {}),
      },
      {
        '@type': 'CreativeWork',
        '@id': workId,
        name: item.title,
        description: item.summary,
        ...(item.url ? { sameAs: item.url } : {}),
        keywords: item.stack.join(', '),
        creator: { '@id': ORG_ID },
        contributor: { '@id': PERSON_ID },
        ...(images.length > 0 ? { image: images } : {}),
      },
    ],
  }
}

/**
 * Q4: Offer с priceCurrency. Google редко показывает цены для Service
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

/**
 * Мультитип ["SoftwareSourceCode", "SoftwareApplication"] — ровно тот случай,
 * для которого мультитип придуман: первый описывает репозиторий и язык, второй
 * — устанавливаемый пакет (и только он даёт право на rich result).
 *
 * Сознательно НЕ добавляем: softwareVersion (протухнет через месяц после
 * релиза), aggregateRating/review (рейтингов нет, выдумывать — прямое
 * нарушение правил Google), HowTo (тип убран из выдачи в сентябре 2023).
 */
export function palistorGraph(lang: Locale, content: PalistorContent) {
  const url = urlFor(lang, '/palistor')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: content.seoTitle,
        description: content.seoDescription,
        inLanguage: lang,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PALISTOR_ID },
        mainEntity: { '@id': PALISTOR_ID },
        primaryImageOfPage: `${SITE_URL}/works/palistor-1.webp`,
        // Продакшен-внедрения: связываем страницу с двумя живыми доменами.
        // Единственное подтверждаемое отличие от github.com и npmjs.com.
        mentions: content.usedIn.map((project) => ({
          '@type': 'WebSite',
          name: project.title,
          url: project.url,
        })),
      },
      {
        '@type': ['SoftwareSourceCode', 'SoftwareApplication'],
        '@id': PALISTOR_ID,
        name: 'Palistor',
        alternateName: '@projectint/palistor',
        description: content.seoDescription,
        url, // канон — наша страница
        codeRepository: 'https://github.com/ProjectINT/palistor',
        programmingLanguage: { '@type': 'ComputerLanguage', name: 'TypeScript' },
        runtimePlatform: 'React 19',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'JavaScript framework',
        operatingSystem: 'Any',
        license: 'https://spdx.org/licenses/MIT.html',
        // Второе ребро графа к Person из rootGraph: автор связывается не только
        // с работодателем и CV, но и с публичным open-source-артефактом,
        // у которого есть независимые подтверждения на npm и GitHub.
        author: { '@id': PERSON_ID },
        maintainer: { '@id': PERSON_ID },
        publisher: { '@id': ORG_ID },
        keywords: 'mvvm, react, state management, forms, wizard, typescript, ai-friendly',
        screenshot: `${SITE_URL}/works/palistor-1.webp`,
        downloadUrl: 'https://www.npmjs.com/package/palistor',
        installUrl: 'https://www.npmjs.com/package/palistor',
        isAccessibleForFree: true,
        // Единственный способ в schema.org сказать «бесплатно»: для
        // SoftwareApplication Google требует offers либо aggregateRating.
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        sameAs: [
          'https://www.npmjs.com/package/palistor',
          'https://github.com/ProjectINT/palistor',
          'https://projectint.github.io/palistor/',
        ],
      },
    ],
  }
}

/**
 * FAQ-сниппеты Google с августа 2023 показывает только гос- и медресурсам —
 * визуального выигрыша в выдаче не будет. Разметка всё равно ставится:
 * app/robots.ts осознанно пускает GPTBot, ClaudeBot и компанию, а
 * вопрос-ответная разметка — самый удобный для LLM формат извлечения фактов.
 */
export function faqPage(lang: Locale, path: string, items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: urlFor(lang, path),
    inLanguage: lang,
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
