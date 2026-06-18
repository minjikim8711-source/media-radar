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
          2026 Media Strategy · Marketing &amp; BX Team
        </div>
        <h1 className="text-3xl font-bold text-slate-100 leading-tight">
          What are you<br />trying to achieve?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Select one or more media channel types to explore opportunities, scores,
          and strategic rationale tailored to your campaign goal.
        </p>
      </section>

      {/* KPI Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Select media channel types
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
          {selected.length === 0 ? 'Explore All Channels' : `View ${totalChannels} Channels`}
          <span className="text-base">→</span>
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Clear selection
          </button>
        )}

        {selected.length === 0 && (
          <p className="text-xs text-slate-500">
            Or select specific channel types above to narrow results.
          </p>
        )}
      </section>

      {/* Quick-stats strip */}
      <section className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8">
        <div>
          <p className="text-2xl font-bold text-slate-100">14</p>
          <p className="text-xs text-slate-500 mt-0.5">Total channels</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-100">6</p>
          <p className="text-xs text-slate-500 mt-0.5">Channel types</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">8</p>
          <p className="text-xs text-slate-500 mt-0.5">Rising trend</p>
        </div>
      </section>
    </main>
  );
}
