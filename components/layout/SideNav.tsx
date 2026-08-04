import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { NavItem, SiteContent } from '@/types/content'
import NavList from './NavList'
import LocaleSwitcher from './LocaleSwitcher'

export default function SideNav({
  lang,
  items,
  site,
}: {
  lang: Locale
  items: NavItem[]
  site: SiteContent
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line lg:flex">
      <div className="px-8 pt-10">
        <Link
          href={`/${lang}`}
          className="text-xl font-bold tracking-tighter focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={site.name}
        >
          YP
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-8 pt-16" aria-label={site.name}>
        <NavList items={items} lang={lang} variant="rail" />
      </nav>

      <div className="space-y-4 px-8 pb-8">
        <LocaleSwitcher lang={lang} />
        <p className="font-mono text-xs tracking-widest text-muted">© 2026 YP</p>
      </div>
    </aside>
  )
}
