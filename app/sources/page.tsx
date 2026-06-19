import Link from 'next/link';
import SourceRegistryClient from '@/components/SourceRegistryClient';
import rawRegistry from '@/data/source-registry.json';

export type Source = {
  id:               string;
  name:             string;
  category:         string;
  sourceUrl:        string;
  monitoringUrl:    string;
  targetAudiences:  string[];
  touchpointTypes:  string[];
  priority:         'high' | 'medium' | 'low';
  note?:            string;
};

export type CategoryStat = {
  category:   string;
  count:      number;
  highCount:  number;
};

export type AudienceStat = {
  label: string;
  count: number;
};

export default function SourcesPage() {
  const sources = rawRegistry.sources as Source[];

  // ── Category breakdown ────────────────────────────────────────────────────
  const catMap = new Map<string, { count: number; high: number }>();
  for (const s of sources) {
    const prev = catMap.get(s.category) ?? { count: 0, high: 0 };
    catMap.set(s.category, {
      count: prev.count + 1,
      high:  prev.high + (s.priority === 'high' ? 1 : 0),
    });
  }

  const CATEGORY_ORDER = [
    'OOH Suppliers',
    'Digital Advertising Platforms',
    'Partnership Platforms',
    'Public Opportunity Sources',
    'Competitor Monitoring Sources',
  ];

  const categoryStats: CategoryStat[] = CATEGORY_ORDER.map(cat => ({
    category:  cat,
    count:     catMap.get(cat)?.count    ?? 0,
    highCount: catMap.get(cat)?.high     ?? 0,
  }));

  // ── Audience frequency ────────────────────────────────────────────────────
  const audienceMap = new Map<string, number>();
  for (const s of sources) {
    for (const a of s.targetAudiences) {
      const cleaned = a.replace(/\s*\([^)]*\)/g, '').trim();
      audienceMap.set(cleaned, (audienceMap.get(cleaned) ?? 0) + 1);
    }
  }

  const audienceStats: AudienceStat[] = Array.from(audienceMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);

  const totalHigh       = sources.filter(s => s.priority === 'high').length;
  const uniqueAudiences = audienceMap.size;

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">홈</Link>
        <span>/</span>
        <span className="text-slate-300">소스 레지스트리</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">소스 레지스트리</h1>
        <p className="text-sm text-slate-400 mt-1">
          신규 매체 발굴 모니터링 소스 현황 — {sources.length}개 등록 · {CATEGORY_ORDER.length}개 카테고리
        </p>
      </div>

      <SourceRegistryClient
        sources={sources}
        categoryStats={categoryStats}
        audienceStats={audienceStats}
        totalHigh={totalHigh}
        uniqueAudiences={uniqueAudiences}
      />
    </main>
  );
}
