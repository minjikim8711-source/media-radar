'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { kpis, resolveCategories, resolveKpis } from '@/data/kpi-mapping';
import MediaChannelCard, { type MediaChannel } from './MediaChannelCard';

type SortKey = 'score' | 'name' | 'competition';

const compOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };

const accentPillMap: Record<string, string> = {
  blue:    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  violet:  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  pink:    'bg-pink-500/15 text-pink-300 border-pink-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  orange:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
};

interface WeeklyMeta {
  generatedAt:   string;
  weekLabel:     string;
  weekTheme?:    string;
  aiCommentary?: string;
  scoreWeights?: Record<string, number>;
}

interface Props {
  kpiIds:   string[];
  channels: MediaChannel[];
  source:   'weekly' | 'static';
  meta:     WeeklyMeta | null;
}

export default function ResultsClient({ kpiIds, channels, source, meta }: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('score');

  const activeKpis = useMemo(() => resolveKpis(kpiIds), [kpiIds]);

  const relevantChannels = useMemo(() => {
    const categories = resolveCategories(kpiIds);
    return categories.length === 0
      ? channels
      : channels.filter(ch => categories.includes(ch.category));
  }, [kpiIds, channels]);

  // Score-rank is always derived from score order, independent of display sort
  const scoreRankMap = useMemo(() => {
    const byScore = [...relevantChannels].sort((a, b) => b.score - a.score);
    const map = new Map<string, number>();
    byScore.forEach((ch, i) => map.set(ch.name, i + 1));
    return map;
  }, [relevantChannels]);

  const sorted = useMemo(() => {
    return [...relevantChannels].sort((a, b) => {
      if (sort === 'name')        return a.name.localeCompare(b.name);
      if (sort === 'competition') return compOrder[a.competition] - compOrder[b.competition];
      return b.score - a.score;
    });
  }, [relevantChannels, sort]);

  const toggleKpi = (id: string) => {
    const next = kpiIds.includes(id)
      ? kpiIds.filter(k => k !== id)
      : [...kpiIds, id];
    const q = next.length > 0 ? `?kpis=${next.join(',')}` : '';
    router.push(`/results${q}`);
  };

  return (
    <div className="space-y-6">

      {/* ── Data source banner ─────────────────────────────────────────── */}
      {source === 'weekly' && meta ? (
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Weekly AI Report</span>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs font-medium text-slate-200">{meta.weekLabel}</span>
              {meta.weekTheme && (
                <span className="text-[11px] text-blue-300 font-medium">· {meta.weekTheme}</span>
              )}
              <span className="text-[11px] text-slate-500">
                · Generated {new Date(meta.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {meta.aiCommentary && (
              <p className="text-[11px] text-slate-400 leading-relaxed">{meta.aiCommentary}</p>
            )}
            {meta.scoreWeights && (
              <div className="flex flex-wrap gap-3 pt-0.5">
                {Object.entries(meta.scoreWeights).map(([k, w]) => (
                  <span key={k} className="text-[10px] text-slate-500">
                    <span className="text-slate-400 font-medium capitalize">{k}</span> {Math.round(w * 100)}%
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span className="text-[11px] text-slate-500">
            Showing static dataset · Run <code className="text-slate-400 bg-slate-700/60 px-1 py-0.5 rounded text-[10px]">npm run generate-weekly</code> to load AI-generated opportunities
          </span>
        </div>
      )}

      {/* ── Filter panel ───────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Active filters</p>
            <div className="flex flex-wrap gap-2">
              {activeKpis.length === 0 ? (
                <span className="text-xs text-slate-500">None — showing all {channels.length} channels</span>
              ) : (
                activeKpis.map(k => (
                  <button
                    key={k.id}
                    onClick={() => toggleKpi(k.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity hover:opacity-70 ${accentPillMap[k.accentClass]}`}
                  >
                    {k.label}
                    <span className="text-[10px] opacity-60">×</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="score">Score (high → low)</option>
              <option value="name">Name (A → Z)</option>
              <option value="competition">Competition (low → high)</option>
            </select>
          </div>
        </div>

        {/* KPI toggles */}
        <div>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Refine by channel type</p>
          <div className="flex flex-wrap gap-2">
            {kpis.map(k => {
              const active = kpiIds.includes(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => toggleKpi(k.id)}
                  className={[
                    'text-xs px-3 py-1 rounded-full border transition-all duration-100',
                    active
                      ? `${accentPillMap[k.accentClass]} font-medium`
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300',
                  ].join(' ')}
                >
                  {active ? '✓ ' : ''}{k.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results header + legend ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-100">
            {sorted.length} channel{sorted.length !== 1 ? 's' : ''} found
          </h2>
          {kpiIds.length > 0 && (
            <span className="text-xs text-slate-500">
              across {resolveCategories(kpiIds).length} categor{resolveCategories(kpiIds).length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />High ≥ 8.0</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Medium ≥ 6.5</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Low &lt; 6.5</span>
          <span className="flex items-center gap-1.5"><span className="text-yellow-300">★</span>Top ≥ 8.5</span>
        </div>
      </div>

      {/* ── Cards ──────────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
          <span className="text-5xl">◌</span>
          <p className="text-sm">No channels match the selected filters.</p>
          <button
            onClick={() => router.push('/results')}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(ch => (
            <MediaChannelCard
              key={ch.name}
              ch={ch}
              rank={scoreRankMap.get(ch.name) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
