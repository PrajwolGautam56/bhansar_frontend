import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AddLeadModal } from '../components/AddLeadModal';
import { AvatarInitials } from '../components/AvatarInitials';
import { BadgeStatus } from '../components/BadgeStatus';
import { LeadDetailPanel } from '../components/LeadDetailPanel';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useLeads } from '../hooks/useLeads';
import { dateLabel, dueColor } from '../lib/utils';
import { useUiStore } from '../store/uiStore';

const stages = ['', 'NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'];

export default function LeadsPage() {
  const [stage, setStage] = useState('');
  const [search, setSearch] = useState('');
  const query = useMemo(() => `?stage=${stage}&search=${encodeURIComponent(search)}`, [stage, search]);
  const { data, refetch } = useLeads(query);
  const { activeModal, openModal, closeModal, selectedLeadId, openDetailPanel, closeDetailPanel } = useUiStore();

  return (
    <>
      <TopBar title="Leads" actions={<Button onClick={() => openModal('lead')}><Plus size={16} /> Add Lead</Button>} />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((item) => (
            <button key={item || 'all'} onClick={() => setStage(item)} className={`rounded-full px-3 py-1 text-sm font-medium ${stage === item ? 'bg-brand text-white' : 'bg-white text-slate-600'}`}>
              {item || 'All'}
            </button>
          ))}
          <div className="w-full flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 sm:ml-auto sm:w-auto">
            <Search size={16} className="text-slate-400" />
            <input className="border-0 px-0 ring-0 focus:ring-0" placeholder="Search leads" onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Import type</th><th>Stage</th><th>Last called</th><th>Next call</th><th>Agent</th><th>Remarks</th></tr></thead>
            <tbody>
              {data?.items.map((lead) => (
                <tr key={lead._id} onClick={() => openDetailPanel(lead._id)} className="cursor-pointer hover:bg-slate-50">
                  <td><div className="flex items-center gap-2"><AvatarInitials name={lead.fullName} /><span className="font-semibold">{lead.fullName}</span></div></td>
                  <td>{lead.company?.name || '-'}</td>
                  <td>{lead.company?.importProducts?.slice(0, 2).join(', ') || '-'}</td>
                  <td><BadgeStatus value={lead.stage} /></td>
                  <td>{dateLabel(lead.lastCalledDate)}</td>
                  <td className={dueColor(lead.nextCallDate)}>{dateLabel(lead.nextCallDate)}</td>
                  <td>{lead.assignedTo?.name || '-'}</td>
                  <td className="max-w-48 truncate">{lead.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LeadDetailPanel leadId={selectedLeadId} onClose={closeDetailPanel} />
      {activeModal === 'lead' && <AddLeadModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
