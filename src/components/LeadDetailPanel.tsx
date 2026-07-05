import { Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { dateLabel } from '../lib/utils';
import type { CallLog, Lead, Reminder } from '../types';
import { AvatarInitials } from './AvatarInitials';
import { BadgeStatus } from './BadgeStatus';
import { CallLogTimeline } from './CallLogTimeline';
import { LogCallModal } from './LogCallModal';
import { SetReminderModal } from './SetReminderModal';
import { Button } from './ui/Button';

export function LeadDetailPanel({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'calls' | 'reminders'>('details');
  const [lead, setLead] = useState<Lead | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modal, setModal] = useState<'call' | 'reminder' | null>(null);
  const [phoneCallStartedAt, setPhoneCallStartedAt] = useState<Date | null>(null);
  const [phoneCallDuration, setPhoneCallDuration] = useState<number | undefined>();

  async function load() {
    if (!leadId) return;
    const { data } = await api.get<{ lead: Lead; callLogs: CallLog[]; reminders: Reminder[] }>(`/leads/${leadId}`);
    setLead(data.lead);
    setCallLogs(data.callLogs);
    setReminders(data.reminders);
  }

  useEffect(() => {
    void load();
  }, [leadId]);

  async function updateLead(patch: Partial<Lead>) {
    if (!lead) return;
    const { data } = await api.put<Lead>(`/leads/${lead._id}`, patch);
    setLead({ ...lead, ...data });
  }

  function openCallLogAfterDial(startedAt: Date) {
    const elapsed = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));
    setPhoneCallDuration(elapsed);
    setModal('call');
  }

  function startPhoneCall() {
    if (!lead?.phone) {
      setModal('call');
      return;
    }

    const startedAt = new Date();
    setPhoneCallStartedAt(startedAt);
    let handled = false;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !handled) {
        handled = true;
        window.removeEventListener('visibilitychange', onVisible);
        window.setTimeout(() => openCallLogAfterDial(startedAt), 500);
      }
    };
    window.addEventListener('visibilitychange', onVisible);
    window.setTimeout(() => {
      if (document.visibilityState === 'visible' && !handled) {
        handled = true;
        window.removeEventListener('visibilitychange', onVisible);
        openCallLogAfterDial(startedAt);
      }
    }, 1500);
    window.location.href = `tel:${lead.phone}`;
  }

  if (!leadId) return null;

  return (
    <aside className="fixed inset-x-0 bottom-0 top-0 z-40 h-dvh w-full overflow-auto border-l border-slate-200 bg-white shadow-soft md:left-auto md:w-[420px]">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <h2 className="font-semibold">Lead details</h2>
        <button onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><X size={18} /></button>
      </div>
      {lead ? (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <AvatarInitials name={lead.fullName} className="h-11 w-11" />
            <div>
              <h3 className="font-semibold">{lead.fullName}</h3>
              <p className="text-sm text-slate-500">{lead.designation || 'Contact'} at {lead.company?.name || 'No company'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(['details', 'calls', 'reminders'] as const).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`rounded-md px-2 py-2 text-sm font-medium ${tab === item ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                {item}
              </button>
            ))}
          </div>
          {tab === 'details' && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Stage</span>
                <select value={lead.stage} onChange={(event) => void updateLead({ stage: event.target.value as Lead['stage'] })}>
                  {['NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'].map((stage) => <option key={stage}>{stage}</option>)}
                </select>
              </div>
              <p><span className="text-slate-500">Phone:</span> {lead.phone || '-'}</p>
              <p><span className="text-slate-500">Email:</span> {lead.email || '-'}</p>
              <p><span className="text-slate-500">Last called:</span> {dateLabel(lead.lastCalledDate)}</p>
              <label className="block">
                <span className="mb-1 block text-slate-500">Next call</span>
                <input type="date" defaultValue={lead.nextCallDate?.slice(0, 10)} onBlur={(event) => void updateLead({ nextCallDate: event.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-500">Remarks</span>
                <textarea className="w-full" defaultValue={lead.remarks} onBlur={(event) => void updateLead({ remarks: event.target.value })} />
              </label>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold">Company</p>
                <p className="mt-1">{lead.company?.name || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lead.company?.importProducts?.map((product) => <span key={product} className="rounded bg-white px-2 py-1 text-xs">{product}</span>)}
                </div>
                <p className="mt-2 text-xs text-slate-500">{lead.company?.importFrequency} · {lead.company?.entryPort}</p>
              </div>
              <div>
                <p className="font-semibold">Related / mutual persons</p>
                <p className="text-slate-600">Mutual: {lead.mutualPerson || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lead.relatedLeads?.map((item) => <BadgeStatus key={item._id} value={item.fullName} className="bg-slate-100 text-slate-700" />)}
                  {lead.relatedContacts?.map((item) => <BadgeStatus key={item._id} value={item.fullName} className="bg-violet-100 text-violet-700" />)}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={startPhoneCall} disabled={!lead.phone}>
                  <Phone size={16} /> Call
                </Button>
                <Button onClick={() => setModal('call')}>Log Call</Button>
                <Button className="bg-slate-900" onClick={() => setModal('reminder')}>Set Reminder</Button>
              </div>
            </div>
          )}
          {tab === 'calls' && (
            <div className="mt-4">
              <div className="mb-3 flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={startPhoneCall} disabled={!lead.phone}>
                  <Phone size={16} /> Call
                </Button>
                <Button onClick={() => setModal('call')}>Log a call</Button>
              </div>
              <CallLogTimeline logs={callLogs} />
            </div>
          )}
          {tab === 'reminders' && (
            <div className="mt-4 space-y-3">
              <Button onClick={() => setModal('reminder')}>Add reminder</Button>
              {reminders.map((reminder) => (
                <div key={reminder._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold">{dateLabel(reminder.reminderDate)}</p>
                  <p className="text-sm text-slate-600">{reminder.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="p-4 text-sm text-slate-500">Loading lead...</p>
      )}
      {modal === 'call' && (
        <LogCallModal
          leadId={leadId}
          initialCalledAt={phoneCallStartedAt || undefined}
          initialDurationSeconds={phoneCallDuration}
          title={phoneCallStartedAt ? 'Add remarks after call' : 'Log call'}
          onClose={() => {
            setModal(null);
            setPhoneCallStartedAt(null);
            setPhoneCallDuration(undefined);
          }}
          onSaved={() => void load()}
        />
      )}
      {modal === 'reminder' && <SetReminderModal leadId={leadId} onClose={() => setModal(null)} onSaved={() => void load()} />}
    </aside>
  );
}
