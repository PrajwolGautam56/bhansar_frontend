import { useApi } from './useApi';
import type { Lead, Paginated } from '../types';

export function useLeads(query = '') {
  return useApi<Paginated<Lead>>(`/leads${query}`);
}
