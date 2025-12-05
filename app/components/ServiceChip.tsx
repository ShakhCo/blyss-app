export interface ServiceChipProps {
  icon: string;
  name: string;
  onClick?: () => void;
}

export function ServiceChip({ icon, name, onClick }: ServiceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-base flex items-center gap-2 bg-stone-100 dark:bg-stone-700 py-1 px-2 rounded-full shrink-0 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors dark:text-stone-200"
    >
      <div className="w-5 h-5 shrink-0">
        <img src={icon} alt={name} className="w-full h-full" />
      </div>
      <span className="whitespace-nowrap">{name}</span>
    </button>
  );
}
