import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { SiteContent } from '@/types/content'

export default function HeroPlaceholder({
  lang,
  site,
}: {
  lang: Locale
  site: SiteContent
}) {
  return (
    // STAGE-2: заменить целиком на <HeroScene /> (React Three Fiber)
    <section className="relative flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center overflow-hidden text-center lg:min-h-[calc(100dvh-6rem)]">
      <div
        aria-hidden
        className="animate-hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.08),transparent_60%)]"
      />
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      <div className="relative space-y-8 px-6">
        <p
          aria-hidden
          className="bg-gradient-to-b from-white to-[#555] bg-clip-text text-[clamp(8rem,22vw,20rem)] font-bold leading-none tracking-tighter text-transparent"
        >
          YP
        </p>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {site.name}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {site.role}
          </p>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted lg:text-lg">
            {site.tagline}
          </p>
        </div>
        <div className="flex items-center justify-center gap-6 font-mono text-sm uppercase tracking-widest">
          <Link
            href={`/${lang}/works`}
            className="border-b border-fg pb-1 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {lang === 'ru' ? 'Работы' : 'Work'}
          </Link>
          <Link
            href={`/${lang}/contacts`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {lang === 'ru' ? 'Контакты' : 'Contact'}
          </Link>
        </div>
      </div>
    </section>
  )
}
