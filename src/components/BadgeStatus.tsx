import { cn } from '../lib/utils';

const colors: Record<string, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  INTERESTED: 'bg-blue-100 text-blue-700',
  NEGOTIATING: 'bg-amber-100 text-amber-700',
  ONBOARDING: 'bg-violet-100 text-violet-700',
  CLIENT: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700',
  LEAD: 'bg-slate-100 text-slate-700',
  ACTIVE_CLIENT: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-red-100 text-red-700',
  POSITIVE: 'bg-emerald-100 text-emerald-700',
  NEUTRAL: 'bg-slate-100 text-slate-700',
  NEGATIVE: 'bg-red-100 text-red-700',
  NO_ANSWER: 'bg-amber-100 text-amber-700',
  MUTUAL: 'bg-violet-100 text-violet-700',
  LEAD_CONTACT: 'bg-blue-100 text-blue-700',
  CLIENT_REFERRAL: 'bg-emerald-100 text-emerald-700'
};

export function BadgeStatus({ value, className }: { value?: string; className?: string }) {
  if (!value) return null;
  return <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', colors[value] || 'bg-slate-100 text-slate-700', className)}>{value.replace(/_/g, ' ')}</span>;
}
