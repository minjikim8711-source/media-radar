'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { kpis, resolveCategories, resolveKpis } from '@/data/kpi-mapping';
import MediaChannelCard, { type MediaChannel } from './MediaChannelCard';
import DiscoveryFeed, { type Discovery, type DiscoverySummary } from './DiscoveryFeed';

type SortKey = 'score' | 'name' | 'competition';

const compOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };

const weightLabel: Record<string, string> = {
  kpiFit:      'KPI 적합도',
  novelty:     '혁신성',
  reach:       '도달 범위',
  feasibility: '실현 가능성',
};

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
  kpiIds:           string[];
  channels:         MediaChannel[];
  source:           'weekly' | 'static';
  meta:             WeeklyMeta | null;
  discoveries:      Discovery[];
  discoverySummary: DiscoverySummary | null;
}

export default function ResultsClient({ kpiIds, channels, source, meta, discoveries, discoverySummary }: Props) {
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
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">주간 AI 분석 리포트</span>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs font-medium text-slate-200">{meta.weekLabel}</span>
              {meta.weekTheme && (
                <span className="text-[11px] text-blue-300 font-medium">· {meta.weekTheme}</span>
              )}
              <span className="text-[11px] text-slate-500">
                · 생성 시각 {new Date(meta.generatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {meta.aiCommentary && (
              <p className="text-[11px] text-slate-400 leading-relaxed">{meta.aiCommentary}</p>
            )}
            {meta.scoreWeights && (
              <div className="flex flex-wrap gap-3 pt-0.5">
                {Object.entries(meta.scoreWeights).map(([k, w]) => (
                  <span key={k} className="text-[10px] text-slate-500">
                    <span className="text-slate-400 font-medium">{weightLabel[k] ?? k}</span> {Math.round(w * 100)}%
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
            정적 데이터 표시 중 · <code className="text-slate-400 bg-slate-700/60 px-1 py-0.5 rounded text-[10px]">npm run generate-weekly</code> 실행 시 AI 생성 추천 결과가 로드됩니다
          </span>
        </div>
      )}

      {/* ── Discovery feed (weekly only) ───────────────────────────────── */}
      {source === 'weekly' && (
        <DiscoveryFeed
          discoveries={discoveries}
          summary={discoverySummary}
          updatedDate={meta?.generatedAt}
        />
      )}

      {/* ── Filter panel ───────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-2">활성 필터</p>
            <div className="flex flex-wrap gap-2">
              {activeKpis.length === 0 ? (
                <span className="text-xs text-slate-500">없음 — 전체 {channels.length}개 채널 표시 중</span>
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
            <span className="text-xs text-slate-500">정렬:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="score">점수 높은 순</option>
              <option value="name">이름 순</option>
              <option value="competition">경쟁도 낮은 순</option>
            </select>
          </div>
        </div>

        {/* KPI toggles */}
        <div>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-2">채널 유형별 필터</p>
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
            추천 결과 {sorted.length}개
          </h2>
          {kpiIds.length > 0 && (
            <span className="text-xs text-slate-500">
              {resolveCategories(kpiIds).length}개 카테고리
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />높음 ≥ 8.0</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />보통 ≥ 6.5</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />낮음 &lt; 6.5</span>
          <span className="flex items-center gap-1.5"><span className="text-yellow-300">★</span>최우선 ≥ 8.5</span>
        </div>
      </div>

      {/* ── Cards ──────────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
          <span className="text-5xl">◌</span>
          <p className="text-sm">선택한 필터에 맞는 채널이 없습니다.</p>
          <button
            onClick={() => router.push('/results')}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            필터 전체 해제
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
