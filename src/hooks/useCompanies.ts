import { useApi } from './useApi';
import type { Company, Paginated } from '../types';

export function useCompanies(query = '') {
  return useApi<Paginated<Company>>(`/companies${query}`);
}
