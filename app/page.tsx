'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { kpis } from '@/data/kpi-mapping';
import KpiCard from '@/components/KpiCard';

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);

  const totalChannels = useMemo(() => {
    if (selected.length === 0) return 14;
    const seen = new Set<string>();
    kpis
      .filter(k => selected.includes(k.id))
      .flatMap(k => k.categories)
      .forEach(c => seen.add(c));
    return kpis
      .filter(k => selected.includes(k.id))
      .reduce((sum, k) => sum + k.channelCount, 0);
  }, [selected]);

  const handleExplore = () => {
    const q = selected.length > 0 ? `?kpis=${selected.join(',')}` : '';
    router.push(`/results${q}`);
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Hero */}
      <section className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          2026 미디어 전략 · 마케팅 & BX팀
        </div>
        <h1 className="text-3xl font-bold text-slate-100 leading-tight">
          어떤 목표를<br />달성하려 하시나요?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          하나 이상의 채널 유형을 선택해 기회 점수와 전략적 근거를 확인하세요.
        </p>
      </section>

      {/* KPI Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          채널 유형 선택
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpis.map(kpi => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              selected={selected.includes(kpi.id)}
              onToggle={() => toggle(kpi.id)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          onClick={handleExplore}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30"
        >
          {selected.length === 0 ? '전체 채널 탐색' : `채널 ${totalChannels}개 보기`}
          <span className="text-base">→</span>
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            선택 초기화
          </button>
        )}

        {selected.length === 0 && (
          <p className="text-xs text-slate-500">
            위에서 채널 유형을 선택하면 결과를 좁힐 수 있습니다.
          </p>
        )}
      </section>

      {/* Quick-stats strip */}
      <section className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8">
        <div>
          <p className="text-2xl font-bold text-slate-100">14</p>
          <p className="text-xs text-slate-500 mt-0.5">전체 채널</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-100">6</p>
          <p className="text-xs text-slate-500 mt-0.5">채널 유형</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">8</p>
          <p className="text-xs text-slate-500 mt-0.5">상승 트렌드</p>
        </div>
      </section>
    </main>
  );
}
