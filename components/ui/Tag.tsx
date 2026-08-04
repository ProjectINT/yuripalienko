export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-muted">
      {children}
    </span>
  )
}
