import type { Locale } from './i18n'
import type {
  HeroCard,
  SiteContent,
  NavContent,
  WorksContent,
  AboutContent,
  ArticlesContent,
  PricingContent,
  CvContent,
  ContactsContent,
} from '@/types/content'

import ruSite from '@/content/ru/site.json'
import ruNav from '@/content/ru/nav.json'
import ruWorks from '@/content/ru/works.json'
import ruAbout from '@/content/ru/about.json'
import ruArticles from '@/content/ru/articles.json'
import ruPricing from '@/content/ru/pricing.json'
import ruCv from '@/content/ru/cv.json'
import ruContacts from '@/content/ru/contacts.json'

import enSite from '@/content/en/site.json'
import enNav from '@/content/en/nav.json'
import enWorks from '@/content/en/works.json'
import enAbout from '@/content/en/about.json'
import enArticles from '@/content/en/articles.json'
import enPricing from '@/content/en/pricing.json'
import enCv from '@/content/en/cv.json'
import enContacts from '@/content/en/contacts.json'

import worksMedia from '@/content/works-media.json'

// Скриншоты общие для обеих локалей, поэтому подмешиваются сюда, а не лежат
// в content/{ru,en}/works.json — иначе один и тот же список пришлось бы править
// в двух местах при каждом новом скриншоте.
function withMedia(content: WorksContent): WorksContent {
  const media: Record<string, string[]> = worksMedia.media
  return {
    ...content,
    items: content.items.map((item) => ({
      ...item,
      images: (media[item.slug] ?? []).map((name) => ({
        name,
        src: `/works/${name}.webp`,
        card: `/works/cards/${name}.webp`,
      })),
    })),
  }
}

const site: Record<Locale, SiteContent> = { ru: ruSite, en: enSite }
const nav: Record<Locale, NavContent> = { ru: ruNav, en: enNav }
const works: Record<Locale, WorksContent> = { ru: withMedia(ruWorks), en: withMedia(enWorks) }
const about: Record<Locale, AboutContent> = { ru: ruAbout, en: enAbout }
const articles: Record<Locale, ArticlesContent> = { ru: ruArticles, en: enArticles }
const pricing: Record<Locale, PricingContent> = { ru: ruPricing, en: enPricing }
const cv: Record<Locale, CvContent> = { ru: ruCv, en: enCv }
const contacts: Record<Locale, ContactsContent> = { ru: ruContacts, en: enContacts }

export const getSite = (lang: Locale) => site[lang]
export const getNav = (lang: Locale) => nav[lang]
export const getWorks = (lang: Locale) => works[lang]
export const getAbout = (lang: Locale) => about[lang]
export const getArticles = (lang: Locale) => articles[lang]
export const getPricing = (lang: Locale) => pricing[lang]
export const getCv = (lang: Locale) => cv[lang]
export const getContacts = (lang: Locale) => contacts[lang]

/** Плоский список скриншотов для кольца карточек в hero: одна картинка — одна карточка */
export const getHeroCards = (lang: Locale): HeroCard[] =>
  works[lang].items.flatMap((item) =>
    (item.images ?? []).map((image) => ({
      slug: item.slug,
      title: item.title,
      src: image.card,
      full: image.src,
    })),
  )
