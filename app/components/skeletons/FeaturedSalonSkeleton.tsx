export function FeaturedSalonSkeleton() {
  return (
    <div className="w-[220px] shrink-0 animate-pulse">
      <div className="w-full h-[194px] bg-stone-200 dark:bg-stone-700 rounded-xl" />
      <div className="pt-3 px-2 pb-1 space-y-2">
        <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-4 w-36 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-3 w-28 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="flex items-center gap-2 pt-2">
          <div className="size-4 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedSalonsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pl-4 pr-3 pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeaturedSalonSkeleton key={i} />
      ))}
    </div>
  );
}
