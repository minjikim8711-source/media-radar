'use client';

import { KPI } from '@/data/kpi-mapping';

// Tailwind needs full class strings — can't interpolate at runtime
const accentMap: Record<string, {
  border: string; bg: string; text: string; badge: string; ring: string; icon: string;
}> = {
  blue:    { border: 'border-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    badge: 'bg-blue-500/20 text-blue-300',    ring: 'ring-blue-500/40',    icon: 'bg-blue-500/20 text-blue-300' },
  violet:  { border: 'border-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-300',  badge: 'bg-violet-500/20 text-violet-300',  ring: 'ring-violet-500/40',  icon: 'bg-violet-500/20 text-violet-300' },
  pink:    { border: 'border-pink-500',    bg: 'bg-pink-500/10',    text: 'text-pink-300',    badge: 'bg-pink-500/20 text-pink-300',    ring: 'ring-pink-500/40',    icon: 'bg-pink-500/20 text-pink-300' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300', ring: 'ring-emerald-500/40', icon: 'bg-emerald-500/20 text-emerald-300' },
  amber:   { border: 'border-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   badge: 'bg-amber-500/20 text-amber-300',   ring: 'ring-amber-500/40',   icon: 'bg-amber-500/20 text-amber-300' },
  orange:  { border: 'border-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-300',  badge: 'bg-orange-500/20 text-orange-300',  ring: 'ring-orange-500/40',  icon: 'bg-orange-500/20 text-orange-300' },
};

const ICONS: Record<string, string> = {
  cinema:       '◈',
  transit:      '⬡',
  experiential: '◇',
  retail:       '▣',
  ooh:          '◉',
  sponsorship:  '★',
};

interface Props {
  kpi: KPI;
  selected: boolean;
  onToggle: () => void;
}

export default function KpiCard({ kpi, selected, onToggle }: Props) {
  const a = accentMap[kpi.accentClass];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative text-left w-full rounded-xl border p-5 transition-all duration-150 focus:outline-none focus-visible:ring-2',
        selected
          ? `${a.border} ${a.bg} ${a.ring}`
          : 'border-slate-800 bg-slate-900 hover:border-slate-600',
      ].join(' ')}
    >
      {/* Checkmark */}
      {selected && (
        <span className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${a.badge}`}>
          ✓
        </span>
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${a.icon}`}>
        {ICONS[kpi.id]}
      </div>

      <p className={`text-sm font-semibold mb-1 ${selected ? a.text : 'text-slate-100'}`}>
        {kpi.label}
      </p>
      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
        {kpi.description}
      </p>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.badge}`}>
        {kpi.channelCount} channel{kpi.channelCount !== 1 ? 's' : ''}
      </span>
    </button>
  );
}
