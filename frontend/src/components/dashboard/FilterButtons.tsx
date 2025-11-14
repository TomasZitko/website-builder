import { cn } from '@/utils/cn';

type Filter = 'all' | 'paid' | 'unpaid' | 'published';

interface FilterButtonsProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  counts: {
    all: number;
    paid: number;
    unpaid: number;
    published: number;
  };
}

export function FilterButtons({ activeFilter, onFilterChange, counts }: FilterButtonsProps) {
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'published', label: 'Published' }
  ];

  return (
    <div className="flex gap-2">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeFilter === key
              ? 'bg-accent text-white'
              : 'bg-panel text-text-muted hover:text-text hover:bg-border'
          )}
        >
          {label} ({counts[key]})
        </button>
      ))}
    </div>
  );
}
