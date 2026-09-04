export default function LoadingSkeleton({ rows = 3, variant = "row" }: { rows?: number; variant?: "row" | "card" | "detail" }) {
  if (variant === "detail") {
    return <div className="space-y-4" aria-label="Loading content"><div className="h-28 animate-pulse bg-muted" /><div className="grid gap-4 md:grid-cols-2"><div className="h-44 animate-pulse bg-muted" /><div className="h-44 animate-pulse bg-muted" /></div></div>;
  }
  return <div className={variant === "card" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"} aria-label="Loading content">
    {Array.from({ length: rows }).map((_, index) => <div key={index} className={`${variant === "card" ? "h-52" : "h-20"} animate-pulse border border-border bg-card`} />)}
  </div>;
}
