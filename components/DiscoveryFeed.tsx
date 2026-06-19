'use client';

import { useState } from 'react';

export interface Discovery {
  title:            string;
  source:           string;
  category:         string;
  discoveryDate:    string;
  whyItMatters:     string;
  opportunityScore: number;
  isNew?:           boolean;
  isReturning?:     boolean;
}

export interface DiscoverySummary {
  newCount:                  number;
  returningCount:            number;
  removedFromLastWeekCount:  number;
  newTitles:                 string[];
  returningTitles:           string[];
  removedFromLastWeekTitles: string[];
  hasPreviousWeek:           boolean;
}

// ── Colour maps ───────────────────────────────────────────────────────────────
const catColor: Record<string, string> = {
  'OOH':               'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Transit':           'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Transit Branding':  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Cinema':            'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Public Bidding':    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Retail Partnership':'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'Fintech Platform':  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'EV Infrastructure': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Coworking':         'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

function scoreStyle(score: number): { pill: string; label: string } {
  if (score >= 9.0) return { pill: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: '즉시 검토' };
  if (score >= 7.5) return { pill: 'text-amber-400   bg-amber-500/10   border-amber-500/30',   label: '관심 필요' };
  return                   { pill: 'text-slate-400   bg-slate-500/10   border-slate-500/25',   label: '모니터링' };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Single discovery row ──────────────────────────────────────────────────────
function DiscoveryRow({ d, index }: { d: Discovery; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const catCls      = catColor[d.category] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  const { pill }    = scoreStyle(d.opportunityScore);

  return (
    <li
      className="group cursor-pointer border border-slate-800 rounded-xl bg-slate-900 hover:border-slate-700 transition-colors"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="px-4 py-3.5 space-y-2">

        {/* Badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rank */}
          <span className="text-[10px] font-mono font-semibold text-slate-600 tabular-nums">#{index + 1}</span>

          {/* Status badge */}
          {d.isNew ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30">
              ✦ 신규 발견
            </span>
          ) : d.isReturning ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-400/25">
              ↺ 재등장
            </span>
          ) : null}

          {/* Category */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${catCls}`}>
            {d.category}
          </span>

          {/* Score — right-aligned */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-medium ${pill.split(' ')[0]}`}>
              {scoreStyle(d.opportunityScore).label}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums border ${pill}`}>
              {d.opportunityScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-slate-100 leading-snug pr-4">{d.title}</p>

        {/* Source + date */}
        <p className="text-[10px] text-slate-500">{d.source} · {formatDate(d.discoveryDate)}</p>

        {/* Expanded: why it matters */}
        {expanded && (
          <div className="pt-1 space-y-1 border-t border-slate-800 mt-1">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pt-2">이 기회가 중요한 이유</p>
            <p className="text-xs text-slate-400 leading-relaxed">{d.whyItMatters}</p>
          </div>
        )}
      </div>

      {/* Expand/collapse hint */}
      <div className="px-4 pb-2.5 flex justify-end">
        <span className="text-[9px] text-slate-700 group-hover:text-slate-500 transition-colors">
          {expanded ? '접기 ▴' : '자세히 보기 ▾'}
        </span>
      </div>
    </li>
  );
}

// ── Feed ──────────────────────────────────────────────────────────────────────
interface Props {
  discoveries:  Discovery[];
  summary?:     DiscoverySummary | null;
  updatedDate?: string;
}

export default function DiscoveryFeed({ discoveries, summary, updatedDate }: Props) {
  if (!discoveries || discoveries.length === 0) return null;

  const totalCount  = discoveries.length;
  const newCount    = discoveries.filter(d => d.isNew).length;
  const hasPrev     = summary?.hasPreviousWeek ?? false;
  const removed     = summary?.removedFromLastWeekTitles ?? [];

  const displayDate = updatedDate
    ? new Date(updatedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : '';

  return (
    <section className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-base font-bold text-slate-100">🔥 이번 주 신규 매체 발견</h2>
          {displayDate && (
            <span className="text-[10px] text-slate-600">{displayDate} 기준</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-slate-300">
            신규 발견 <span className="text-white">{totalCount}건</span>
          </span>
          {hasPrev && newCount > 0 && newCount < totalCount && (
            <span className="text-sm text-slate-500">
              · 전주 대비 <span className="text-rose-400 font-semibold">+{newCount}건</span> 첫 등장
            </span>
          )}
          {hasPrev && newCount === totalCount && (
            <span className="text-sm text-slate-500">
              · 전주 대비 <span className="text-rose-400 font-semibold">전부 신규</span>
            </span>
          )}
          {!hasPrev && newCount === totalCount && (
            <span className="text-[11px] text-slate-600">첫 생성 — 전주 비교 없음</span>
          )}
        </div>
      </div>

      {/* ── Discovery list ── */}
      <ul className="space-y-2">
        {discoveries.map((d, i) => (
          <DiscoveryRow key={i} d={d} index={i} />
        ))}
      </ul>

      {/* ── Removed section ── */}
      {removed.length > 0 && (
        <>
          <div className="border-t border-slate-800" />

          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              지난주 대비 사라진 기회
            </p>
            <ul className="space-y-1.5">
              {removed.map(title => (
                <li key={title} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
