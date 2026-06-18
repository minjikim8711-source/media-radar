import { Trend } from '@/types';

const config: Record<Trend, { icon: string; classes: string }> = {
  Rising:   { icon: '↑', classes: 'text-emerald-400' },
  Stable:   { icon: '→', classes: 'text-slate-400' },
  Declining:{ icon: '↓', classes: 'text-red-400' },
};

export default function TrendIndicator({ trend }: { trend: Trend }) {
  const { icon, classes } = config[trend];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${classes}`}>
      {icon} {trend}
    </span>
  );
}
