import { Button } from "@heroui/react";

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  placeholder = "Qidirish...",
  onSearch,
  onFilterClick,
  showFilter = true,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchBarProps) {
  return (
    <div className="flex gap-3 h-12">
      <div className="relative flex-1 h-full">
        <input
          type="search"
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-full pl-4 pr-4 bg-stone-100 dark:bg-stone-800 rounded-2xl text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all"
        />
      </div>
      {showFilter && (
        <div className="h-full">
          <Button
            className="rounded-2xl h-full w-12"
            variant="secondary"
            onPress={onFilterClick}
          >
            <svg
              className="size-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
