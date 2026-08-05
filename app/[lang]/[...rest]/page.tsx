import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Ловит все несуществующие пути внутри /[lang]/ и отдаёт
// app/[lang]/not-found.tsx внутри общего layout (с меню).

export function generateMetadata(): Metadata {
  return { robots: { index: false, follow: false } }
}

export default function CatchAllPage() {
  notFound()
}
