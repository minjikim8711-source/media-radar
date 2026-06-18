import { Status } from '@/types';

const config: Record<Status, { label: string; classes: string; dot: string }> = {
  Explore:      { label: 'Explore',      classes: 'bg-violet-500/15 text-violet-300 border-violet-500/30', dot: 'bg-violet-400' },
  Pilot:        { label: 'Pilot',        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',   dot: 'bg-amber-400' },
  Scale:        { label: 'Scale',        classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Monitor:      { label: 'Monitor',      classes: 'bg-sky-500/15 text-sky-300 border-sky-500/30',         dot: 'bg-sky-400' },
  Deprioritize: { label: 'Deprioritize', classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',   dot: 'bg-slate-500' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, classes, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
