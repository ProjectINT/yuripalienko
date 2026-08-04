export default function Card({
  children,
  featured = false,
}: {
  children: React.ReactNode
  featured?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-6 lg:p-8 ${
        featured ? 'border-fg bg-line/30' : 'border-line'
      }`}
    >
      {children}
    </div>
  )
}
