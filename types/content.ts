export interface SiteContent {
  name: string
  role: string
  tagline: string
  description: string
}

export interface NavItem {
  href: string
  label: string
  index: string
}

export interface NavContent {
  items: NavItem[]
}

export interface WorkItem {
  slug: string
  title: string
  url: string | null
  role: string
  period: string
  company: string
  summary: string
  highlights: string[]
  stack: string[]
  featured: boolean
}

export interface WorksContent {
  title: string
  intro: string
  items: WorkItem[]
}

export interface AboutContent {
  title: string
  lead: string
  paragraphs: string[]
  facts: { label: string; value: string }[]
  links: { label: string; url: string }[]
}

export interface ArticleItem {
  title: string
  platform: string
  url: string
  summary: string
  lang: string
}

export interface ArticlesContent {
  title: string
  intro: string
  items: ArticleItem[]
}

export interface PricingTier {
  slug: string
  title: string
  price: string
  priceNote: string
  summary: string
  includes: string[]
  featured: boolean
}

export interface PricingContent {
  title: string
  intro: string
  tiers: PricingTier[]
  note: string
}

export interface CvJob {
  company: string
  companyNote: string
  role: string
  period: string
  duration: string
  summary: string
  bullets: string[]
  stack: string[]
  current: boolean
}

export interface CvContent {
  title: string
  intro: string
  pdfUrl: string
  pdfLabel: string
  profile: string
  facts: { label: string; value: string }[]
  jobs: CvJob[]
  stack: { group: string; items: string[] }[]
  education: { year: string; title: string; note: string }[]
}

export interface ContactsContent {
  title: string
  intro: string
  channels: { label: string; value: string; url: string; primary: boolean }[]
  location: string
  availability: string
}
