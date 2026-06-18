'use client';

import { MediaOpportunity } from '@/types';
import { getOverallScore } from '@/data/opportunities';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import TrendIndicator from './TrendIndicator';
import ScoreBar from './ScoreBar';

const priorityDot: Record<string, string> = {
  High:   'bg-red-400',
  Medium: 'bg-amber-400',
  Low:    'bg-slate-500',
};

const scoreColor = (s: number) =>
  s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-amber-400' : 'text-red-400';

export default function OpportunityCard({ o }: { o: MediaOpportunity }) {
  const overall = getOverallScore(o);
  return (
    <div className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-5 gap-4 hover:border-slate-600 hover:shadow-lg hover:shadow-black/40 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge category={o.category} />
            <StatusBadge status={o.status} />
          </div>
          <h3 className="text-sm font-semibold text-slate-100 leading-snug mt-2">{o.name}</h3>
          {o.nameKo && (
            <p className="text-xs text-slate-500 mt-0.5">{o.nameKo}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-2xl font-bold tabular-nums ${scoreColor(overall)}`}>{overall}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Overall</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{o.description}</p>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <ScoreBar label="Reach" value={o.reach} color="bg-blue-500" />
        <ScoreBar label="Brand Fit" value={o.brandFit} color="bg-violet-500" />
        <ScoreBar label="Cost Eff." value={o.costEfficiency} color="bg-emerald-500" />
        <ScoreBar label="Comp. Edge" value={o.competitiveEdge} color="bg-orange-500" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${priorityDot[o.priority]}`} />
          <span className="text-xs text-slate-400">{o.priority} Priority</span>
        </div>
        <TrendIndicator trend={o.trend} />
      </div>

      {/* Hover detail overlay */}
      <div className="absolute inset-0 rounded-xl bg-slate-900/95 p-5 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={o.category} />
          <StatusBadge status={o.status} />
        </div>
        <h3 className="text-sm font-semibold text-slate-100">{o.name}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{o.description}</p>
        <div className="grid grid-cols-2 gap-2 mt-auto text-xs">
          <div>
            <span className="text-slate-500 block">Target</span>
            <span className="text-slate-200">{o.targetAudience}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Budget</span>
            <span className="text-slate-200">{o.estimatedBudget}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Time to Launch</span>
            <span className="text-slate-200">{o.timeToLaunch}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Trend</span>
            <TrendIndicator trend={o.trend} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {o.tags.map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
