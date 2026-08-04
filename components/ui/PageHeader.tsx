export default function PageHeader({
  title,
  intro,
}: {
  title: string
  intro?: string
}) {
  return (
    <header className="space-y-4">
      <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none tracking-tighter">
        {title}
      </h1>
      {intro ? (
        <p className="max-w-prose text-base leading-relaxed text-muted lg:text-lg">
          {intro}
        </p>
      ) : null}
    </header>
  )
}
