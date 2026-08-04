import type { Locale } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Locale }) {
  return (
    <footer className="border-t border-line px-6 py-8 lg:px-12">
      <p className="mx-auto w-full max-w-5xl font-mono text-xs tracking-widest text-muted">
        © 2026 Yuri Palienko ·{' '}
        {lang === 'ru' ? 'Сделано на Next.js' : 'Built with Next.js'}
      </p>
    </footer>
  )
}
