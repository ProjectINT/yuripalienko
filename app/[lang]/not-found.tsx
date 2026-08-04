import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-[50dvh] flex-col items-start justify-center gap-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">404</p>
      <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none tracking-tighter">
        Page not found
      </h1>
      <p className="max-w-prose leading-relaxed text-muted">
        Страница не найдена. / This page does not exist.
      </p>
      <Link
        href="/"
        className="border-b border-fg pb-1 font-mono text-sm uppercase tracking-widest transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ← Home
      </Link>
    </section>
  )
}
