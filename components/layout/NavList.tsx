'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import type { NavItem } from '@/types/content'

export default function NavList({
  items,
  lang,
  variant,
}: {
  items: NavItem[]
  lang: Locale
  variant: 'rail' | 'drawer'
}) {
  const pathname = usePathname()

  return (
    <ul className={variant === 'rail' ? 'space-y-5' : 'space-y-6'}>
      {items.map((item) => {
        const href = `/${lang}${item.href}`
        const isActive = pathname === href
        return (
          <li key={item.href}>
            <Link
              href={href}
              className={`group flex items-baseline gap-3 transition-transform duration-200 hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isActive ? 'text-fg' : 'text-muted hover:text-fg'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                aria-hidden
                className={`h-px w-4 self-center bg-fg transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="font-mono text-xs tracking-widest text-muted">
                {item.index}
              </span>
              <span
                className={
                  variant === 'rail'
                    ? 'text-lg font-medium leading-tight'
                    : 'text-2xl font-medium leading-tight'
                }
              >
                {item.label}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
