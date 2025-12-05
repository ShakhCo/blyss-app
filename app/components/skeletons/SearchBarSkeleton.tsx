export function SearchBarSkeleton() {
  return (
    <div className="flex gap-3 h-12 animate-pulse">
      <div className="flex-1 h-full bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="h-full w-12 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
    </div>
  );
}
