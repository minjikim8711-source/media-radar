'use client';

import { useState, useMemo } from 'react';
import type { Source, CategoryStat, AudienceStat } from '@/app/sources/page';

// ── Category metadata (full literal classes for Tailwind v4) ────────────────
const CAT_META: Record<string, {
  label:       string;
  pill:        string;
  tabActive:   string;
  barColor:    string;
  dotColor:    string;
}> = {
  'OOH Suppliers': {
    label:     'OOH 공급자',
    pill:      'bg-violet-500/15 text-violet-300 border-violet-500/30',
    tabActive: 'bg-violet-500/20 text-violet-200 border-violet-500/40',
    barColor:  'bg-violet-500',
    dotColor:  'bg-violet-400',
  },
  'Digital Advertising Platforms': {
    label:     '디지털 광고',
    pill:      'bg-blue-500/15 text-blue-300 border-blue-500/30',
    tabActive: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
    barColor:  'bg-blue-500',
    dotColor:  'bg-blue-400',
  },
  'Partnership Platforms': {
    label:     '파트너십',
    pill:      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    tabActive: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    barColor:  'bg-emerald-500',
    dotColor:  'bg-emerald-400',
  },
  'Public Opportunity Sources': {
    label:     '공공 기회',
    pill:      'bg-amber-500/15 text-amber-300 border-amber-500/30',
    tabActive: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    barColor:  'bg-amber-500',
    dotColor:  'bg-amber-400',
  },
  'Competitor Monitoring Sources': {
    label:     '경쟁사 모니터링',
    pill:      'bg-rose-500/15 text-rose-300 border-rose-500/30',
    tabActive: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
    barColor:  'bg-rose-500',
    dotColor:  'bg-rose-400',
  },
};

const PRIORITY_META = {
  high:   { label: '높음', cls: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' },
  medium: { label: '보통', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/25' },
  low:    { label: '낮음', cls: 'text-slate-500 bg-slate-700/20 border border-slate-700/40' },
};

const CATEGORY_ORDER = [
  'OOH Suppliers',
  'Digital Advertising Platforms',
  'Partnership Platforms',
  'Public Opportunity Sources',
  'Competitor Monitoring Sources',
];

// ── Source card ─────────────────────────────────────────────────────────────
function SourceCard({ s }: { s: Source }) {
  const [expanded, setExpanded] = useState(false);
  const cat  = CAT_META[s.category];
  const pri  = PRIORITY_META[s.priority];

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900 hover:border-slate-700 transition-colors">
      <div
        className="p-4 space-y-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Top row: category + priority */}
        <div className="flex items-center gap-2 flex-wrap">
          {cat && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${cat.pill}`}>
              {cat.label}
            </span>
          )}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ${pri.cls}`}>
            {pri.label}
          </span>
          <span className="ml-auto text-[10px] font-mono text-slate-700">{s.id}</span>
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-slate-100 leading-snug">{s.name}</p>

        {/* Touchpoint types */}
        <div className="flex flex-wrap gap-1">
          {s.touchpointTypes.slice(0, 3).map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/50">
              {t}
            </span>
          ))}
          {s.touchpointTypes.length > 3 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 text-[10px]">
              +{s.touchpointTypes.length - 3}
            </span>
          )}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="pt-2 space-y-3 border-t border-slate-800">
            {/* Audiences */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">대상 고객</p>
              <div className="flex flex-wrap gap-1">
                {s.targetAudiences.map(a => (
                  <span key={a} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* All touchpoints */}
            {s.touchpointTypes.length > 3 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">접점 유형 전체</p>
                <div className="flex flex-wrap gap-1">
                  {s.touchpointTypes.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/50">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {s.note && (
              <p className="text-[10px] text-slate-600 italic leading-relaxed">{s.note}</p>
            )}

            {/* Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                웹사이트 ↗
              </a>
              {s.monitoringUrl !== s.sourceUrl && (
                <a
                  href={s.monitoringUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  모니터링 페이지 ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand hint */}
      <div className="px-4 pb-2.5 flex justify-between items-center">
        <a
          href={s.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors"
        >
          {s.sourceUrl.replace('https://', '').replace('http://', '').split('/')[0]}
        </a>
        <span className="text-[9px] text-slate-700">
          {expanded ? '접기 ▴' : '자세히 ▾'}
        </span>
      </div>
    </div>
  );
}

// ── Category breakdown sidebar block ─────────────────────────────────────────
function CategoryBreakdown({
  stats,
  activeCategory,
  onSelect,
}: {
  stats:           CategoryStat[];
  activeCategory:  string;
  onSelect:        (cat: string) => void;
}) {
  const maxCount = Math.max(...stats.map(s => s.count));

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">카테고리별 현황</p>
      <div className="space-y-2.5">
        {stats.map(s => {
          const meta     = CAT_META[s.category];
          const isActive = activeCategory === s.category;
          const pct      = (s.count / maxCount) * 100;

          return (
            <button
              key={s.category}
              onClick={() => onSelect(isActive ? '전체' : s.category)}
              className="w-full text-left space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium transition-colors ${
                  isActive ? (meta?.dotColor ?? '') + ' text-slate-100' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {meta?.label ?? s.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-500 font-medium tabular-nums">
                    {s.highCount > 0 ? `↑${s.highCount}` : ''}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300 tabular-nums">{s.count}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${meta?.barColor ?? 'bg-slate-500'} ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-70'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Audience list sidebar block ───────────────────────────────────────────────
function AudienceList({ stats }: { stats: AudienceStat[] }) {
  const maxCount = stats[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">주요 타겟 고객</p>
      <div className="space-y-1.5">
        {stats.map(a => (
          <div key={a.label} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-slate-400 truncate pr-2">{a.label}</span>
                <span className="text-[10px] font-semibold text-slate-500 tabular-nums shrink-0">{a.count}</span>
              </div>
              <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500/50"
                  style={{ width: `${(a.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────
interface Props {
  sources:          Source[];
  categoryStats:    CategoryStat[];
  audienceStats:    AudienceStat[];
  totalHigh:        number;
  uniqueAudiences:  number;
}

export default function SourceRegistryClient({
  sources,
  categoryStats,
  audienceStats,
  totalHigh,
  uniqueAudiences,
}: Props) {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [highOnly,       setHighOnly]       = useState(false);

  const filtered = useMemo(() => {
    let list = sources;
    if (activeCategory !== '전체') list = list.filter(s => s.category === activeCategory);
    if (highOnly)                  list = list.filter(s => s.priority === 'high');
    return list;
  }, [sources, activeCategory, highOnly]);

  const highPrioritySources = useMemo(() =>
    sources.filter(s => s.priority === 'high'), [sources]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
  };

  const tabs = ['전체', ...CATEGORY_ORDER];

  return (
    <div className="space-y-6">

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: sources.length,    label: '전체 소스',     color: 'text-slate-100' },
          { value: totalHigh,         label: '높음 우선순위', color: 'text-emerald-400' },
          { value: categoryStats.length, label: '카테고리',   color: 'text-blue-400' },
          { value: uniqueAudiences,   label: '타겟 고객 유형', color: 'text-violet-400' },
        ].map(stat => (
          <div key={stat.label} className="border border-slate-800 rounded-xl bg-slate-900 px-4 py-3.5">
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Category filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(tab => {
          const isActive = activeCategory === tab;
          const meta     = CAT_META[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                tab === '전체'
                  ? isActive
                    ? 'bg-slate-700 text-slate-100 border-slate-600'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  : isActive
                    ? (meta?.tabActive ?? 'bg-slate-700 text-slate-100 border-slate-600')
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {tab === '전체' ? '전체' : (meta?.label ?? tab)}
              <span className="ml-1.5 tabular-nums text-[10px] opacity-60">
                {tab === '전체'
                  ? sources.length
                  : categoryStats.find(c => c.category === tab)?.count ?? 0}
              </span>
            </button>
          );
        })}

        {/* Priority toggle */}
        <button
          onClick={() => setHighOnly(h => !h)}
          className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            highOnly
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          ↑ 높음 우선순위만
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-20">

          {/* Category breakdown */}
          <div className="border border-slate-800 rounded-xl bg-slate-900 p-4">
            <CategoryBreakdown
              stats={categoryStats}
              activeCategory={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>

          {/* High priority list */}
          <div className="border border-slate-800 rounded-xl bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">높음 우선순위</p>
              <span className="text-[10px] font-semibold text-emerald-400 tabular-nums">{highPrioritySources.length}개</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {highPrioritySources.map(s => {
                const meta = CAT_META[s.category];
                return (
                  <div key={s.id} className="flex items-start gap-2 py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${meta?.dotColor ?? 'bg-slate-500'}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-200 leading-snug">{s.name}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{meta?.label ?? s.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audience breakdown */}
          <div className="border border-slate-800 rounded-xl bg-slate-900 p-4">
            <AudienceList stats={audienceStats} />
          </div>
        </div>

        {/* Source cards */}
        <div className="space-y-4">
          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="text-slate-200 font-semibold">{filtered.length}개</span>
              {' '}소스
              {activeCategory !== '전체' && (
                <> — <span className="text-slate-400">{CAT_META[activeCategory]?.label}</span></>
              )}
              {highOnly && <> · 높음 우선순위만</>}
            </p>
            {(activeCategory !== '전체' || highOnly) && (
              <button
                onClick={() => { setActiveCategory('전체'); setHighOnly(false); }}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                필터 초기화
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="border border-slate-800 rounded-xl bg-slate-900 px-6 py-12 text-center">
              <p className="text-sm text-slate-500">해당 조건에 맞는 소스가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(s => (
                <SourceCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
