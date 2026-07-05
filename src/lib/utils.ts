import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name?: string) {
  return (name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function dateLabel(value?: string) {
  if (!value) return '-';
  return dayjs(value).format('MMM D, YYYY');
}

export function dateTimeLabel(value?: string) {
  if (!value) return '-';
  return dayjs(value).format('MMM D, YYYY h:mm A');
}

export function dueColor(value?: string) {
  if (!value) return 'text-slate-500';
  const due = dayjs(value).startOf('day');
  const today = dayjs().startOf('day');
  if (due.isBefore(today)) return 'text-red-600';
  if (due.isSame(today)) return 'text-amber-600';
  return 'text-emerald-600';
}
