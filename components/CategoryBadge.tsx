import { Category } from '@/types';

const config: Record<Category, { classes: string }> = {
  Social:      { classes: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  Content:     { classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  Emerging:    { classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  Partnership: { classes: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
};

export default function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config[category].classes}`}>
      {category}
    </span>
  );
}
