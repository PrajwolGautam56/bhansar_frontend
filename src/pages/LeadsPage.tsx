import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddLeadModal } from '../components/AddLeadModal';
import { AvatarInitials } from '../components/AvatarInitials';
import { BadgeStatus } from '../components/BadgeStatus';
import { LeadDetailPanel } from '../components/LeadDetailPanel';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useLeads } from '../hooks/useLeads';
import api from '../lib/axios';
import { dateLabel, dueColor } from '../lib/utils';
import { useUiStore } from '../store/uiStore';

const stages = ['', 'NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'];

export default function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stage = searchParams.get('stage') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limit = Number(searchParams.get('limit')) || 50;
  const [searchInput, setSearchInput] = useState(search);
  const query = useMemo(() => `?stage=${stage}&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`, [stage, search, page, limit]);
  const { data, refetch } = useLeads(query);
  const { activeModal, openModal, closeModal, selectedLeadId, openDetailPanel, closeDetailPanel } = useUiStore();

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
      if (value === null || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: false });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: false });
  }

  async function deleteLead(leadId: string, leadName: string) {
    if (!window.confirm(`Delete ${leadName} and its follow-up history?`)) return;
    try {
      await api.delete(`/leads/${leadId}`);
      if (selectedLeadId === leadId) closeDetailPanel();
      void refetch();
    } catch {
      window.alert('Only admins can delete leads.');
    }
  }

  return (
    <>
      <TopBar title="Leads" actions={<Button onClick={() => openModal('lead')}><Plus size={16} /> Add Lead</Button>} />
      <div className="space-y-4 p-4 md:p-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search leads</label>
              <div className="flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                <Search size={17} className="text-slate-400" />
                <input className="w-full border-0 bg-transparent px-0 text-sm ring-0 focus:ring-0" placeholder="Lead name, phone, email, mutual person..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
              </div>
            </div>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:w-[130px]">
              Rows
              <select value={limit} onChange={(event) => updateParams({ limit: Number(event.target.value), page: '1' })}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {stages.map((item) => (
              <button key={item || 'all'} onClick={() => updateParams({ stage: item, page: '1' })} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${stage === item ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {item || 'All'}
              </button>
            ))}
            {(search || stage) && (
              <button className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        </section>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Import type</th><th>Stage</th><th>Last called</th><th>Next call</th><th>Agent</th><th>Remarks</th><th /></tr></thead>
            <tbody>
              {data?.items.map((lead) => (
                <tr key={lead._id} onClick={() => openDetailPanel(lead._id)} className="cursor-pointer transition hover:bg-slate-50">
                  <td><div className="flex items-center gap-2"><AvatarInitials name={lead.fullName} /><span className="font-semibold">{lead.fullName}</span></div></td>
                  <td>{lead.company?.name || '-'}</td>
                  <td>{lead.company?.importProducts?.slice(0, 2).join(', ') || '-'}</td>
                  <td><BadgeStatus value={lead.stage} /></td>
                  <td>{dateLabel(lead.lastCalledDate)}</td>
                  <td className={dueColor(lead.nextCallDate)}>{dateLabel(lead.nextCallDate)}</td>
                  <td>{lead.assignedTo?.name || '-'}</td>
                  <td className="max-w-48 truncate">{lead.remarks || '-'}</td>
                  <td>
                    <button
                      className="font-semibold text-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        void deleteLead(lead._id, lead.fullName);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-500">No leads found for these filters.</td>
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
      <LeadDetailPanel leadId={selectedLeadId} onClose={closeDetailPanel} />
      {activeModal === 'lead' && <AddLeadModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
