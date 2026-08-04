export default function CvFacts({
  facts,
}: {
  facts: { label: string; value: string }[]
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="font-mono text-xs uppercase tracking-widest text-muted">
            {fact.label}
          </dt>
          <dd className="mt-1 break-words leading-relaxed">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
