import { Phone, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import api from '../lib/axios';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useCompanies } from '../hooks/useCompanies';
import { useUiStore } from '../store/uiStore';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [phoneStatus, setPhoneStatus] = useState<'all' | 'with' | 'without'>('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const query = useMemo(
    () => `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}&phoneStatus=${phoneStatus}`,
    [page, limit, search, sortBy, sortOrder, phoneStatus]
  );
  const { data, refetch } = useCompanies(query);
  const { activeModal, openModal, closeModal } = useUiStore();

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
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
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
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

  return (
    <>
      <TopBar title="Companies" actions={<Button onClick={() => openModal('company')}><Plus size={16} /> Add Company</Button>} />
      <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-200 px-3">
            <Search size={16} className="text-slate-400" />
            <input className="w-full border-0 px-0 ring-0 focus:ring-0" placeholder="Search company, EXIM, district, location" value={search} onChange={(event) => updateSearch(event.target.value)} />
          </div>
          <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <select value={phoneStatus} onChange={(event) => { setPhoneStatus(event.target.value as 'all' | 'with' | 'without'); setPage(1); }}>
            <option value="all">All numbers</option>
            <option value="with">With phone number</option>
            <option value="without">Without phone number</option>
          </select>
          <p className="text-sm text-slate-500">{data?.total || 0} companies</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
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
                <tr key={company._id}>
                  <td><p className="font-semibold">{company.name}</p><p className="text-xs text-slate-500">{company.location}, {company.district}</p></td>
                  <td>{company.eximCode || '-'}</td>
                  <td>
                    {company.phoneNumbers?.length ? (
                      <a className="inline-flex items-center gap-1 font-semibold text-emerald-700" href={`tel:${company.phoneNumbers[0]}`}>
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
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button className="bg-slate-900" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
            Previous
          </Button>
          <p className="text-sm text-slate-500">Page {data?.page || page} of {data?.pages || 1}</p>
          <Button className="bg-slate-900" disabled={!data || page >= data.pages} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>
      {activeModal === 'company' && <AddCompanyModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
