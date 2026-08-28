import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Ловит все несуществующие пути внутри /[lang]/ и отдаёт
// app/[lang]/not-found.tsx внутри общего layout (с меню).

/**
 * Метаданные сливаются по сегментам поверхностно, поэтому всё, что здесь не
 * задано, наследуется от layout — то есть от главной: её canonical, hreflang
 * и OG-карточка. Битая ссылка тогда превьюшится в мессенджере как главная.
 * `null` гасит унаследованное поле целиком (Metadata допускает null).
 */
export function generateMetadata(): Metadata {
  return {
    title: '404',
    robots: { index: false, follow: false },
    alternates: null,
    openGraph: null,
    twitter: null,
  }
}

export default function CatchAllPage() {
  notFound()
}
