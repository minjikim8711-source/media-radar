import fs   from 'fs';
import path from 'path';
import Link from 'next/link';
import ResultsClient from '@/components/ResultsClient';
import type { MediaChannel } from '@/components/MediaChannelCard';
import type { Discovery, DiscoverySummary } from '@/components/DiscoveryFeed';

// Always render fresh — never serve a cached build-time snapshot
export const dynamic = 'force-dynamic';

// ── Types for the weekly file wrapper ────────────────────────────────────────
interface WeeklyMeta {
  generatedAt:  string;
  weekLabel:    string;
  weekTheme?:   string;
  aiCommentary?: string;
  scoreWeights?: Record<string, number>;
}

interface LoadResult {
  channels:          MediaChannel[];
  source:            'weekly' | 'static';
  meta:              WeeklyMeta | null;
  discoveries:       Discovery[];
  discoverySummary:  DiscoverySummary | null;
}

// ── File loader (runs on the server at request time) ─────────────────────────
function loadChannels(): LoadResult {
  const latestPath   = path.join(process.cwd(), 'data', 'weeks', 'latest.json');
  const fallbackPath = path.join(process.cwd(), 'data', 'media-opportunities.json');

  // 1. Try latest.json (generated weekly file)
  if (fs.existsSync(latestPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));

      // Wrapped weekly format: { generatedAt, weekLabel, opportunities: [...], discoveries: [...] }
      if (!Array.isArray(raw) && Array.isArray(raw.opportunities)) {
        return {
          channels:         raw.opportunities as MediaChannel[],
          source:           'weekly',
          discoveries:      Array.isArray(raw.discoveries) ? (raw.discoveries as Discovery[]) : [],
          discoverySummary: raw.discoverySummary ?? null,
          meta: {
            generatedAt:  raw.generatedAt,
            weekLabel:    raw.weekLabel,
            weekTheme:    raw.weekTheme,
            aiCommentary: raw.aiCommentary,
            scoreWeights: raw.scoreWeights,
          },
        };
      }

      // Plain array (edge case: someone manually placed an array in weeks/)
      if (Array.isArray(raw)) {
        return { channels: raw as MediaChannel[], source: 'weekly', meta: null, discoveries: [], discoverySummary: null };
      }
    } catch {
      // Parse failure — fall through to static file
    }
  }

  // 2. Fallback: static curated dataset
  const raw = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
  return { channels: raw as MediaChannel[], source: 'static', meta: null, discoveries: [], discoverySummary: null };
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface Props {
  searchParams: Promise<{ kpis?: string }>;
}

export default async function ResultsPage({ searchParams }: Props) {
  const { kpis }  = await searchParams;
  const kpiIds    = kpis ? kpis.split(',').filter(Boolean) : [];
  const { channels, source, meta, discoveries, discoverySummary } = loadChannels();

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">홈</Link>
        <span>/</span>
        <span className="text-slate-300">추천 매체</span>
        {kpiIds.length > 0 && (
          <>
            <span>/</span>
            <span className="text-slate-400">
              KPI {kpiIds.length}개 선택됨
            </span>
          </>
        )}
      </nav>

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">미디어 기회 탐색</h1>
        <p className="text-sm text-slate-400 mt-1">
          {kpiIds.length === 0
            ? '전체 채널을 표시합니다. KPI 필터를 선택해 결과를 좁혀보세요.'
            : '선택한 KPI 기준으로 필터링 중입니다. 아래 태그를 눌러 필터를 추가하거나 제거하세요.'}
        </p>
      </div>

      <ResultsClient
        kpiIds={kpiIds}
        channels={channels}
        source={source}
        meta={meta}
        discoveries={discoveries}
        discoverySummary={discoverySummary}
      />
    </main>
  );
}
