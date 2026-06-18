'use client';

import { Category, Priority, Status, Trend } from '@/types';

export interface Filters {
  search: string;
  category: Category | 'All';
  status: Status | 'All';
  priority: Priority | 'All';
  trend: Trend | 'All';
  sort: 'score' | 'name' | 'reach' | 'competitive';
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
  visible: number;
}

const Select = ({
  value, onChange, options, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer ${className}`}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function FilterBar({ filters, onChange, total, visible }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search channels..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500 w-44"
        />
        <Select value={filters.category} onChange={v => set('category', v as Filters['category'])}
          options={['All', 'Social', 'Content', 'Emerging', 'Partnership']} />
        <Select value={filters.status} onChange={v => set('status', v as Filters['status'])}
          options={['All', 'Explore', 'Pilot', 'Scale', 'Monitor', 'Deprioritize']} />
        <Select value={filters.priority} onChange={v => set('priority', v as Filters['priority'])}
          options={['All', 'High', 'Medium', 'Low']} />
        <Select value={filters.trend} onChange={v => set('trend', v as Filters['trend'])}
          options={['All', 'Rising', 'Stable', 'Declining']} />

        {(filters.search || filters.category !== 'All' || filters.status !== 'All' || filters.priority !== 'All' || filters.trend !== 'All') && (
          <button
            onClick={() => onChange({ search: '', category: 'All', status: 'All', priority: 'All', trend: 'All', sort: filters.sort })}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{visible}/{total} channels</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <Select value={filters.sort} onChange={v => set('sort', v as Filters['sort'])}
            options={['score', 'name', 'reach', 'competitive']} />
        </div>
      </div>
    </div>
  );
}
