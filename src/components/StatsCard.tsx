import type { ReactNode } from 'react';

export function StatsCard({ title, value, icon }: { title: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="text-brand">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}
