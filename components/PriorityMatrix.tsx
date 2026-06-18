'use client';

import { MediaOpportunity } from '@/types';
import { getOverallScore } from '@/data/opportunities';

const statusColor: Record<string, string> = {
  Explore:      '#a78bfa',
  Pilot:        '#fbbf24',
  Scale:        '#34d399',
  Monitor:      '#38bdf8',
  Deprioritize: '#64748b',
};

export default function PriorityMatrix({ data }: { data: MediaOpportunity[] }) {
  const W = 480;
  const H = 340;
  const PAD = 48;
  const IW = W - PAD * 2;
  const IH = H - PAD * 2;

  const toX = (impact: number) => PAD + ((impact - 1) / 9) * IW;
  const toY = (feasibility: number) => PAD + IH - ((feasibility - 1) / 9) * IH;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Priority Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Impact (Reach × Brand Fit) vs. Feasibility (Cost Efficiency)</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {Object.entries(statusColor).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full">
          {/* Quadrant backgrounds */}
          <rect x={PAD} y={PAD} width={IW / 2} height={IH / 2}
            fill="#1e293b" opacity="0.4" />
          <rect x={PAD + IW / 2} y={PAD} width={IW / 2} height={IH / 2}
            fill="#0f2a1a" opacity="0.5" />
          <rect x={PAD} y={PAD + IH / 2} width={IW / 2} height={IH / 2}
            fill="#1e1e35" opacity="0.4" />
          <rect x={PAD + IW / 2} y={PAD + IH / 2} width={IW / 2} height={IH / 2}
            fill="#1a1a2e" opacity="0.3" />

          {/* Grid lines */}
          <line x1={PAD + IW / 2} y1={PAD} x2={PAD + IW / 2} y2={PAD + IH}
            stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
          <line x1={PAD} y1={PAD + IH / 2} x2={PAD + IW} y2={PAD + IH / 2}
            stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />

          {/* Border */}
          <rect x={PAD} y={PAD} width={IW} height={IH}
            fill="none" stroke="#334155" strokeWidth="1" />

          {/* Quadrant labels */}
          <text x={PAD + IW * 0.75} y={PAD + 16} textAnchor="middle"
            className="text-[10px]" fill="#6ee7b7" fontSize="10" fontWeight="600">SCALE NOW</text>
          <text x={PAD + IW * 0.25} y={PAD + 16} textAnchor="middle"
            fill="#94a3b8" fontSize="10" fontWeight="500">STRATEGIC INVEST</text>
          <text x={PAD + IW * 0.75} y={PAD + IH - 8} textAnchor="middle"
            fill="#94a3b8" fontSize="10" fontWeight="500">QUICK WINS</text>
          <text x={PAD + IW * 0.25} y={PAD + IH - 8} textAnchor="middle"
            fill="#475569" fontSize="10" fontWeight="500">RE-EVALUATE</text>

          {/* Axis labels */}
          <text x={PAD + IW / 2} y={H - 8} textAnchor="middle"
            fill="#64748b" fontSize="9" letterSpacing="1">MARKET IMPACT →</text>
          <text x={10} y={PAD + IH / 2} textAnchor="middle" transform={`rotate(-90, 10, ${PAD + IH / 2})`}
            fill="#64748b" fontSize="9" letterSpacing="1">FEASIBILITY →</text>

          {/* Points */}
          {data.map(o => {
            const impact = (o.reach + o.brandFit) / 2;
            const feasibility = o.costEfficiency;
            const x = toX(impact);
            const y = toY(feasibility);
            const color = statusColor[o.status];
            return (
              <g key={o.id}>
                <circle cx={x} cy={y} r={7} fill={color} opacity="0.25" />
                <circle cx={x} cy={y} r={4} fill={color} />
                <title>{`${o.name}\nImpact: ${impact.toFixed(1)} | Feasibility: ${feasibility}/10\nScore: ${getOverallScore(o)}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
