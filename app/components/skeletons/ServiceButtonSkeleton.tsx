export function ServiceButtonSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
      <div className="size-14 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="h-3 w-12 bg-stone-200 dark:bg-stone-700 rounded" />
    </div>
  );
}

export function ServiceButtonsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceButtonSkeleton key={i} />
      ))}
    </div>
  );
}
