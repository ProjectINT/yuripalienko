export default function ExternalLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={
        className ??
        'underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2'
      }
    >
      {children}
    </a>
  )
}
