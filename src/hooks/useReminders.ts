import { useApi } from './useApi';
import type { Reminder } from '../types';

export function useReminders(query = '') {
  return useApi<Reminder[]>(`/reminders${query}`);
}
