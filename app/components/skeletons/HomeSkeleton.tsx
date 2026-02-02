import { SearchBarSkeleton } from "./SearchBarSkeleton";
import { ServiceButtonsSkeleton } from "./ServiceButtonSkeleton";
import { FeaturedSalonsSkeleton } from "./FeaturedSalonSkeleton";
import { SalonFeedListSkeleton } from "./SalonFeedSkeleton";

export function HomeSkeleton() {
  return (
    <div>
      {/* Search */}
      <div className="px-4 py-6">
        <SearchBarSkeleton />
      </div>

      {/* Services */}
      {/* <div className="px-4">
        <ServiceButtonsSkeleton count={5} />
        <div className="flex items-center justify-center gap-1.5 pt-3">
          <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
          <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>
      </div> */}

      {/* Featured Section */}
      {/* <div className="mt-6 mb-6 bg-gradient-to-br from-stone-100 via-stone-100 to-stone-50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900 rounded-3xl pt-4 overflow-hidden">
        <div className="px-4 mb-4">
          <div className="h-6 w-40 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
          <div className="h-4 w-28 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
        <FeaturedSalonsSkeleton count={3} />
      </div> */}

      {/* Feed */}
      <SalonFeedListSkeleton count={3} />
    </div>
  );
}
