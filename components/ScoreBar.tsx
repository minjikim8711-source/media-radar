interface Props {
  label: string;
  value: number;
  color?: string;
}

export default function ScoreBar({ label, value, color = 'bg-blue-500' }: Props) {
  const pct = (value / 10) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-semibold text-slate-300">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
