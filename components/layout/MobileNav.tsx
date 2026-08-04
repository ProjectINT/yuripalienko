'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import type { NavItem, SiteContent } from '@/types/content'
import NavList from './NavList'
import LocaleSwitcher from './LocaleSwitcher'

export default function MobileNav({
  lang,
  items,
  site,
}: {
  lang: Locale
  items: NavItem[]
  site: SiteContent
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)

  // Закрытие при смене маршрута — сброс состояния во время рендера,
  // а не в эффекте (react-hooks/set-state-in-effect).
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-6 backdrop-blur">
        <Link
          href={`/${lang}`}
          className="text-lg font-bold tracking-tighter focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={site.name}
        >
          YP
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={lang === 'ru' ? 'Открыть меню' : 'Open menu'}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span aria-hidden className="h-px w-6 bg-fg" />
          <span aria-hidden className="h-px w-6 bg-fg" />
        </button>
      </header>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id="mobile-nav-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'ru' ? 'Меню' : 'Menu'}
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col border-r border-line bg-bg px-8 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between">
          <span className="text-lg font-bold tracking-tighter">YP</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={lang === 'ru' ? 'Закрыть меню' : 'Close menu'}
            className="flex h-10 w-10 items-center justify-center text-2xl leading-none text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pt-10" aria-label={site.name}>
          <NavList items={items} lang={lang} variant="drawer" />
        </nav>

        <div className="space-y-4 pb-8">
          <LocaleSwitcher lang={lang} />
          <p className="font-mono text-xs tracking-widest text-muted">© 2026 YP</p>
        </div>
      </div>
    </div>
  )
}
