export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionClick,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <h2 className="font-bold text-xl text-stone-900 dark:text-stone-100 mb-1">{title}</h2>
      {actionLabel && (
        <button
          type="button"
          onClick={onActionClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}
