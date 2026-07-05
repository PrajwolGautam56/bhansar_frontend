import type { ReactNode } from 'react';

export function TopBar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
