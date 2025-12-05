export interface ServiceButtonProps {
  icon: string;
  name: string;
  onClick?: () => void;
}

export function ServiceButton({ icon, name, onClick }: ServiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform"
    >
      <div className="size-14 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-2xl p-2">
        <img src={icon} alt={name} className="size-full object-contain" />
      </div>
      <span className="text-xs font-medium text-stone-600 dark:text-stone-400 w-16 text-center line-clamp-1">
        {name}
      </span>
    </button>
  );
}
