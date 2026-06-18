import { MediaOpportunity } from '@/types';

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: string;
}

export default function StatsOverview({ data }: { data: MediaOpportunity[] }) {
  const total    = data.length;
  const high     = data.filter(o => o.priority === 'High').length;
  const piloting = data.filter(o => o.status === 'Pilot').length;
  const scaling  = data.filter(o => o.status === 'Scale').length;
  const rising   = data.filter(o => o.trend === 'Rising').length;

  const stats: Stat[] = [
    { label: 'Total Channels',    value: total,    sub: 'tracked opportunities',      accent: 'text-blue-400',    icon: '◉' },
    { label: 'High Priority',     value: high,     sub: 'requiring action',            accent: 'text-red-400',     icon: '▲' },
    { label: 'Active Pilots',     value: piloting, sub: 'in testing',                  accent: 'text-amber-400',   icon: '⟳' },
    { label: 'Scaling Now',       value: scaling,  sub: 'in full deployment',          accent: 'text-emerald-400', icon: '↑' },
    { label: 'Rising Trends',     value: rising,   sub: 'momentum channels',           accent: 'text-violet-400',  icon: '✦' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</span>
            <span className={`text-sm ${s.accent}`}>{s.icon}</span>
          </div>
          <span className={`text-3xl font-bold tabular-nums ${s.accent}`}>{s.value}</span>
          {s.sub && <span className="text-[11px] text-slate-500">{s.sub}</span>}
        </div>
      ))}
    </div>
  );
}
