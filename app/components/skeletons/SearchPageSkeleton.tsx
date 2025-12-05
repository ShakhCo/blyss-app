import { SearchBarSkeleton } from "./SearchBarSkeleton";

export function SearchPageSkeleton() {
  return (
    <div className="px-4 py-6">
      <SearchBarSkeleton />

      {/* Recent searches skeleton */}
      <div className="mt-6 space-y-3">
        <div className="h-5 w-32 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="size-10 bg-stone-200 dark:bg-stone-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-stone-200 dark:bg-stone-700 rounded mb-1" />
              <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
