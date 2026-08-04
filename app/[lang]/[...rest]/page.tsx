import { notFound } from 'next/navigation'

// Ловит все несуществующие пути внутри /[lang]/ и отдаёт
// app/[lang]/not-found.tsx внутри общего layout (с меню).
export default function CatchAllPage() {
  notFound()
}
