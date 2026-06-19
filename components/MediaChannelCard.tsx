'use client';

import { useState } from 'react';

export interface MediaChannel {
  name: string;
  category: string;
  description: string;
  why: string;
  score: number;
  trend: string;
  competition: string;
  details: string;
  risks: string[];
  exampleUsage: string;
  // Present only in weekly-generated data
  kpiFit?:         number;
  novelty?:        number;
  reach?:          number;
  feasibility?:    number;
  whyNew?:         string;
  marketAdoption?: string;
  exampleBrands?:  string[];
  expectedImpact?: string;
}

// ── Opportunity tier ─────────────────────────────────────────────────────────
type Tier = 'high' | 'medium' | 'low';

function getTier(score: number): Tier {
  if (score >= 8.0) return 'high';
  if (score >= 6.5) return 'medium';
  return 'low';
}

const tierConfig: Record<Tier, {
  border: string;
  stripe: string;
  dot: string;
  label: string;
  labelColor: string;
  scoreColor: string;
}> = {
  high:   { border: 'border-emerald-500/40', stripe: 'bg-emerald-500',  dot: 'bg-emerald-400', label: 'High Opportunity',   labelColor: 'text-emerald-400', scoreColor: 'text-emerald-400' },
  medium: { border: 'border-amber-500/40',   stripe: 'bg-amber-400',    dot: 'bg-amber-400',   label: 'Medium Opportunity', labelColor: 'text-amber-400',   scoreColor: 'text-amber-400'   },
  low:    { border: 'border-red-500/40',     stripe: 'bg-red-500',      dot: 'bg-red-400',     label: 'Low Opportunity',    labelColor: 'text-red-400',     scoreColor: 'text-red-400'     },
};

// ── Trend / competition ──────────────────────────────────────────────────────
const trendIcon: Record<string, string> = { Rising: '↑', Stable: '→', Declining: '↓' };
const trendColor: Record<string, string> = {
  Rising: 'text-emerald-400', Stable: 'text-slate-400', Declining: 'text-red-400',
};
const compStyle: Record<string, string> = {
  Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Medium: 'text-amber-400   bg-amber-500/10   border-amber-500/25',
  High:   'text-red-400     bg-red-500/10     border-red-500/25',
};

// ── Category pill ─────────────────────────────────────────────────────────────
const catColor: Record<string, string> = {
  Cinema:                  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Transit Branding':      'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'EV Infrastructure':     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Apartment Community':   'bg-teal-500/15 text-teal-300 border-teal-500/30',
  Coworking:               'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Campus:                  'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Healthcare:              'bg-pink-500/15 text-pink-300 border-pink-500/30',
  Airport:                 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Fintech Partnership':   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Retail Partnership':    'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'Public Infrastructure': 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  Audio:                   'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Emerging:                'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

// ── Market adoption badge ─────────────────────────────────────────────────────
const adoptionStyle: Record<string, string> = {
  'Early Adopter': 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  'Emerging':      'bg-violet-500/10 text-violet-300 border-violet-500/25',
  'Growing':       'bg-amber-500/10 text-amber-300 border-amber-500/25',
  'Maturing':      'bg-slate-500/10 text-slate-400 border-slate-500/25',
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  ch: MediaChannel;
  rank: number;
}

export default function MediaChannelCard({ ch, rank }: Props) {
  const [expanded, setExpanded] = useState(false);

  const tier  = getTier(ch.score);
  const cfg   = tierConfig[tier];
  const isTop = ch.score >= 8.5;
  const cat   = catColor[ch.category] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  return (
    <div
      className={[
        'relative flex flex-col bg-slate-900 border rounded-xl overflow-hidden',
        'transition-all duration-200 cursor-pointer',
        expanded
          ? `border ${cfg.border} shadow-lg shadow-black/40`
          : 'border-slate-800 hover:border-slate-600 hover:shadow-md hover:shadow-black/30',
      ].join(' ')}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Left colour stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.stripe}`} />

      {/* ── Collapsed body ── */}
      <div className="pl-4 pr-5 pt-4 pb-4 flex flex-col gap-3">

        {/* Row 1: rank + badges + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rank */}
            <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
              #{rank}
            </span>
            {/* Category */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${cat}`}>
              {ch.category}
            </span>
            {/* TOP badge */}
            {isTop && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 uppercase tracking-wide">
                ★ Top Opportunity
              </span>
            )}
            {/* Market adoption badge */}
            {ch.marketAdoption && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${adoptionStyle[ch.marketAdoption] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/25'}`}>
                {ch.marketAdoption}
              </span>
            )}
          </div>

          {/* Score */}
          <div className="shrink-0 text-right">
            <span className={`text-2xl font-bold tabular-nums leading-none ${cfg.scoreColor}`}>
              {ch.score.toFixed(1)}
            </span>
            <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wide">score</p>
          </div>
        </div>

        {/* Row 2: channel name */}
        <div>
          <h3 className="text-sm font-semibold text-slate-100 leading-snug">{ch.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className={`text-[10px] font-medium ${cfg.labelColor}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Row 3: description */}
        <p className="text-xs text-slate-400 leading-relaxed">{ch.description}</p>

        {/* Row 4: why */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2.5 space-y-1">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Why this channel</p>
          <p className="text-xs text-slate-300 leading-relaxed">{ch.why}</p>
        </div>

        {/* Row 5: footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className={`text-xs font-semibold ${trendColor[ch.trend] ?? 'text-slate-400'}`}>
            {trendIcon[ch.trend]} {ch.trend}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${compStyle[ch.competition] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
              {ch.competition} competition
            </span>
            <span className={`text-[10px] text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div
          className="border-t border-slate-700/60 bg-slate-800/30 px-5 py-4 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Deeper look */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Deeper Look</p>
            <p className="text-xs text-slate-300 leading-relaxed">{ch.details}</p>
          </div>

          {/* Why unconventional + expected impact (weekly data only) */}
          {(ch.whyNew || ch.expectedImpact) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ch.whyNew && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Why Unconventional</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{ch.whyNew}</p>
                </div>
              )}
              {ch.expectedImpact && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Expected Impact</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{ch.expectedImpact}</p>
                </div>
              )}
            </div>
          )}

          {/* Example brands */}
          {ch.exampleBrands && ch.exampleBrands.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Brands Already Using This</p>
              <div className="flex flex-wrap gap-1.5">
                {ch.exampleBrands.map(b => (
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ch.exampleBrands && ch.exampleBrands.length === 0 && (
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Brands Already Using This</p>
              <p className="text-[10px] text-slate-600 italic">None identified in Korea — early-mover opportunity.</p>
            </div>
          )}

          {/* Risks */}
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Risks to Consider</p>
            <ul className="space-y-1.5">
              {ch.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                  <span className="mt-1 w-1 h-1 rounded-full bg-red-400/60 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Example usage */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Example Usage</p>
            <blockquote className="border-l-2 border-blue-500/50 pl-3 text-xs text-slate-300 leading-relaxed italic">
              {ch.exampleUsage}
            </blockquote>
          </div>

          {/* Sub-score breakdown (weekly data only) */}
          {ch.kpiFit !== undefined && (
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score Breakdown</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {([
                  ['KPI Fit',     ch.kpiFit,      'bg-blue-500'],
                  ['Novelty',     ch.novelty,     'bg-violet-500'],
                  ['Reach',       ch.reach,       'bg-emerald-500'],
                  ['Feasibility', ch.feasibility, 'bg-amber-500'],
                ] as [string, number | undefined, string][]).map(([label, val, color]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-300 font-medium tabular-nums">{val?.toFixed(1)}</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${((val ?? 0) / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="text-[10px] text-slate-500 hover:text-slate-300 underline"
            onClick={() => setExpanded(false)}
          >
            Collapse ▴
          </button>
        </div>
      )}
    </div>
  );
}
