// Skeleton placeholders instead of a blocking spinner/splash screen.
// The old approach (full-screen spinner, or a centered "loading…" string)
// blocks the entire layout until data arrives - meaning slow network/cold
// starts feel even slower, because nothing is visible at all. Skeletons
// show the real page structure immediately (shell renders instantly,
// only the data-shaped content shimmers until it arrives) - this doesn't
// make the network faster, but it removes the "did anything happen?"
// dead time that made the wait feel worse than it was.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ink/[0.06] rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-ink/[0.08] rounded-glass p-5">
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonStatRow({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/70 backdrop-blur-xl border border-ink/[0.08] rounded-glass p-5">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
