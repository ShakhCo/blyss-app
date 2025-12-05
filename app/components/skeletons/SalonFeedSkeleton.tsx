export function SalonFeedSkeleton() {
  return (
    <div className="flex flex-col p-0 animate-pulse">
      <div className="px-2">
        <div className="rounded-2xl overflow-hidden w-full">
          <div className="h-48 mb-0.5 bg-stone-200 dark:bg-stone-700" />
          <div className="grid grid-cols-4 gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-200 dark:bg-stone-700" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-2 pt-2 pb-3">
        <div className="col-span-8 px-2 py-1">
          <div className="h-5 w-32 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
          <div className="h-4 w-40 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
        <div className="col-span-4 py-1">
          <div className="h-10 w-full bg-stone-200 dark:bg-stone-700 rounded-xl" />
        </div>
      </div>

      <div className="pb-8 px-3 flex items-center gap-2">
        <div className="h-8 w-16 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="h-8 w-16 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="h-8 w-24 bg-stone-200 dark:bg-stone-700 rounded-full" />
      </div>
    </div>
  );
}

export function SalonFeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <SalonFeedSkeleton key={i} />
      ))}
    </div>
  );
}
