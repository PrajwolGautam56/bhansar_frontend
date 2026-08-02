import { Phone, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useCompanies } from '../hooks/useCompanies';
import { useUiStore } from '../store/uiStore';

type PhoneStatus = 'all' | 'with' | 'without';
type SortOrder = 'asc' | 'desc';

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limit = Number(searchParams.get('limit')) || 50;
  const search = searchParams.get('search') || '';
  const phoneStatus = (searchParams.get('phoneStatus') || 'all') as PhoneStatus;
  const sortBy = searchParams.get('sortBy') || 'updatedAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;
  const [searchInput, setSearchInput] = useState(search);
  const query = useMemo(
    () => `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}&phoneStatus=${phoneStatus}`,
    [page, limit, search, sortBy, sortOrder, phoneStatus]
  );
  const { data, refetch } = useCompanies(query);
  const { activeModal, openModal, closeModal } = useUiStore();
  const hasFilters = Boolean(search || phoneStatus !== 'all' || sortBy !== 'updatedAt' || sortOrder !== 'desc');

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput === search) return;
      updateParams({ search: searchInput, page: '1' });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput, search]);

  function updateParams(updates: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all') next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: false });
  }

  async function deleteCompany(companyId: string, companyName: string) {
    if (!window.confirm(`Delete ${companyName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/companies/${companyId}`);
      void refetch();
    } catch {
      window.alert('Only admins can delete companies.');
    }
  }

  function sortHeading(field: string) {
    if (sortBy === field) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
    } else {
      updateParams({ sortBy: field, sortOrder: 'asc', page: '1' });
    }
  }

  function SortButton({ field, label }: { field: string; label: string }) {
    const active = sortBy === field;
    return (
      <button type="button" className={`inline-flex items-center gap-1 font-semibold ${active ? 'text-brand' : 'text-slate-500'}`} onClick={() => sortHeading(field)}>
        {label}
        <span className="text-[10px]">{active ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    );
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: false });
  }

  return (
    <>
      <TopBar title="Companies" actions={<Button onClick={() => openModal('company')}><Plus size={16} /> Add Company</Button>} />
      <div className="space-y-4 p-4 md:p-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search companies</label>
              <div className="flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                <Search size={17} className="text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent px-0 text-sm ring-0 focus:ring-0"
                  placeholder="Name, EXIM, phone, owner, district..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Call shortlist</label>
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'with', label: 'With number' },
                  { value: 'without', label: 'No number' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`rounded px-3 py-2 text-sm font-semibold transition ${phoneStatus === item.value ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                    onClick={() => updateParams({ phoneStatus: item.value, page: '1' })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-[260px]">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rows
                <select value={limit} onChange={(event) => updateParams({ limit: Number(event.target.value), page: '1' })}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Results</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{data?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {search && <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">Search: {search}</span>}
            {phoneStatus !== 'all' && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{phoneStatus === 'with' ? 'With phone number' : 'Without phone number'}</span>}
            {sortBy !== 'updatedAt' && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Sorted by {sortBy} {sortOrder}</span>}
            {hasFilters && (
              <button className="text-xs font-semibold text-red-600 hover:text-red-700" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        </section>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table>
            <thead>
              <tr>
                <th><SortButton field="name" label="Company" /></th>
                <th><SortButton field="eximCode" label="EXIM" /></th>
                <th>Phone</th>
                <th>Products</th>
                <th><SortButton field="currentServiceProvider" label="Provider" /></th>
                <th><SortButton field="importFrequency" label="Frequency" /></th>
                <th><SortButton field="status" label="Status" /></th>
                <th><SortButton field="entryPort" label="Entry port" /></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((company) => (
                <tr key={company._id} className="transition hover:bg-slate-50">
                  <td><p className="font-semibold text-slate-900">{company.name}</p><p className="text-xs text-slate-500">{company.location || '-'}, {company.district || '-'}</p></td>
                  <td>{company.eximCode || '-'}</td>
                  <td>
                    {company.phoneNumbers?.length ? (
                      <a className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-100" href={`tel:${company.phoneNumbers[0]}`}>
                        <Phone size={14} /> {company.phoneNumbers[0]}
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    {(company.importProductDetails?.length ? company.importProductDetails : company.importProducts?.map((name) => ({ name, hsCode: '' })))?.slice(0, 2).map((product) => (
                      <div key={`${company._id}-${product.name}`} className="text-sm">
                        {product.name}
                        {product.hsCode && <span className="text-xs text-slate-500"> · HS {product.hsCode}</span>}
                      </div>
                    )) || '-'}
                  </td>
                  <td>{company.currentServiceProvider || '-'}</td>
                  <td>{company.importFrequency || '-'}</td>
                  <td><BadgeStatus value={company.status} /></td>
                  <td>{company.entryPort || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link className="font-semibold text-brand" to={`/companies/${company._id}`}>View</Link>
                      <button className="font-semibold text-red-600" onClick={() => void deleteCompany(company._id, company.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-500">No companies found for these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button className="bg-slate-900" disabled={page <= 1} onClick={() => updateParams({ page: Math.max(page - 1, 1) })}>
            Previous
          </Button>
          <p className="text-sm text-slate-500">Page {data?.page || page} of {data?.pages || 1}</p>
          <Button className="bg-slate-900" disabled={!data || page >= data.pages} onClick={() => updateParams({ page: page + 1 })}>
            Next
          </Button>
        </div>
      </div>
      {activeModal === 'company' && <AddCompanyModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
