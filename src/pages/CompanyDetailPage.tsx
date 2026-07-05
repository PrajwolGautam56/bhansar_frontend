import { Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/axios';
import { BadgeStatus } from '../components/BadgeStatus';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { CallLogTimeline } from '../components/CallLogTimeline';
import { LogCallModal } from '../components/LogCallModal';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useApi } from '../hooks/useApi';
import { dateLabel } from '../lib/utils';
import type { CallLog, Company, Contact, Lead, User } from '../types';

function dateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

function LeadEditor({
  companyId,
  lead,
  onClose,
  onSaved
}: {
  companyId: string;
  lead?: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    void api.get<User[]>('/users').then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      email: form.get('email'),
      designation: form.get('designation'),
      company: companyId,
      stage: form.get('stage'),
      nextCallDate: form.get('nextCallDate') || undefined,
      mutualPerson: form.get('mutualPerson'),
      assignedTo: form.get('assignedTo') || undefined,
      remarks: form.get('remarks')
    };

    if (lead?._id) await api.put(`/leads/${lead._id}`, payload);
    else await api.post('/leads', payload);
    onSaved();
    onClose();
  }

  return (
    <Modal title={lead ? 'Edit lead' : 'Add lead'} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <input name="fullName" required placeholder="Full name" defaultValue={lead?.fullName} />
        <input name="phone" placeholder="Phone" defaultValue={lead?.phone} />
        <input name="email" type="email" placeholder="Email" defaultValue={lead?.email} />
        <input name="designation" placeholder="Designation" defaultValue={lead?.designation} />
        <select name="stage" defaultValue={lead?.stage || 'NEW'}>
          {['NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'].map((stage) => <option key={stage}>{stage}</option>)}
        </select>
        <input name="nextCallDate" type="date" defaultValue={dateInput(lead?.nextCallDate)} />
        <select name="assignedTo" defaultValue={lead?.assignedTo?._id || lead?.assignedTo?.id || ''}>
          <option value="">Assigned agent</option>
          {users.map((user) => <option key={user._id || user.id} value={user._id || user.id}>{user.name}</option>)}
        </select>
        <input name="mutualPerson" placeholder="Mutual person" defaultValue={lead?.mutualPerson} />
        <textarea name="remarks" className="md:col-span-2" placeholder="Remarks" defaultValue={lead?.remarks} />
        <div className="md:col-span-2 flex justify-end">
          <Button>{lead ? 'Update lead' : 'Save lead'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ContactEditor({
  companyId,
  contact,
  leads,
  onClose,
  onSaved
}: {
  companyId: string;
  contact?: Contact | null;
  leads: Lead[];
  onClose: () => void;
  onSaved: () => void;
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      email: form.get('email'),
      designation: form.get('designation'),
      company: companyId,
      relationType: form.get('relationType'),
      linkedLeads: form.getAll('linkedLeads'),
      notes: form.get('notes')
    };

    if (contact?._id) await api.put(`/contacts/${contact._id}`, payload);
    else await api.post('/contacts', payload);
    onSaved();
    onClose();
  }

  const linkedLeadIds = new Set(contact?.linkedLeads?.map((lead) => lead._id) || []);

  return (
    <Modal title={contact ? 'Edit contact' : 'Add contact'} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <input name="fullName" required placeholder="Full name" defaultValue={contact?.fullName} />
        <input name="phone" placeholder="Phone" defaultValue={contact?.phone} />
        <input name="email" type="email" placeholder="Email" defaultValue={contact?.email} />
        <input name="designation" placeholder="Designation" defaultValue={contact?.designation} />
        <select name="relationType" defaultValue={contact?.relationType || 'LEAD_CONTACT'}>
          <option value="LEAD_CONTACT">Lead contact</option>
          <option value="MUTUAL">Mutual</option>
          <option value="CLIENT_REFERRAL">Client referral</option>
        </select>
        <select name="linkedLeads" multiple className="min-h-24 md:col-span-2" defaultValue={[...linkedLeadIds]}>
          {leads.map((lead) => <option key={lead._id} value={lead._id}>{lead.fullName}</option>)}
        </select>
        <textarea name="notes" className="md:col-span-2" placeholder="Notes" defaultValue={contact?.notes} />
        <div className="md:col-span-2 flex justify-end">
          <Button>{contact ? 'Update contact' : 'Save contact'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const { data, refetch } = useApi<{ company: Company; leads: Lead[]; contacts: Contact[]; callLogs: CallLog[] }>(`/companies/${id}`);
  const [callLead, setCallLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [leadEditor, setLeadEditor] = useState<Lead | null | 'new'>(null);
  const [contactEditor, setContactEditor] = useState<Contact | null | 'new'>(null);
  const [callStartedAt, setCallStartedAt] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState<number | undefined>();
  const products =
    data?.company.importProductDetails?.length
      ? data.company.importProductDetails
      : data?.company.importProducts?.map((name) => ({ name, hsCode: '' }));

  function openCallLogAfterDial(lead: Lead, startedAt: Date) {
    setCallLead(lead);
    setCallDuration(Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000)));
  }

  function startPhoneCall(lead: Lead) {
    if (!lead.phone) {
      setCallLead(lead);
      return;
    }

    const startedAt = new Date();
    setCallStartedAt(startedAt);
    let handled = false;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !handled) {
        handled = true;
        window.removeEventListener('visibilitychange', onVisible);
        window.setTimeout(() => openCallLogAfterDial(lead, startedAt), 500);
      }
    };
    window.addEventListener('visibilitychange', onVisible);
    window.setTimeout(() => {
      if (document.visibilityState === 'visible' && !handled) {
        handled = true;
        window.removeEventListener('visibilitychange', onVisible);
        openCallLogAfterDial(lead, startedAt);
      }
    }, 1500);
    window.location.href = `tel:${lead.phone}`;
  }

  function closeCallModal() {
    setCallLead(null);
    setCallStartedAt(null);
    setCallDuration(undefined);
  }

  async function deleteContact(contactId: string) {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/contacts/${contactId}`);
      void refetch();
    } catch {
      window.alert('Could not delete contact.');
    }
  }

  async function deleteLead(leadId: string) {
    if (!window.confirm('Delete this lead and its follow-up history?')) return;
    try {
      await api.delete(`/leads/${leadId}`);
      void refetch();
    } catch {
      window.alert('Only admins can delete leads.');
    }
  }

  return (
    <>
      <TopBar title={data?.company.name || 'Company'} actions={<Button onClick={() => setIsEditing(true)}>Edit Company</Button>} />
      <div className="space-y-5 p-4 md:p-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{data?.company.name}</h2>
              <p className="text-sm text-slate-500">{data?.company.location}, {data?.company.district} · PAN {data?.company.panNumber || '-'}</p>
            </div>
            <BadgeStatus value={data?.company.status} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Current service provider</p>
              <p className="mt-1 text-sm font-medium">{data?.company.currentServiceProvider || '-'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Import frequency</p>
              <p className="mt-1 text-sm font-medium">{data?.company.importFrequency || '-'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Entry port</p>
              <p className="mt-1 text-sm font-medium">{data?.company.entryPort || '-'}</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Imported products</p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table>
                <thead><tr><th>Product</th><th>HS code</th></tr></thead>
                <tbody>
                  {products?.length ? products.map((product) => (
                    <tr key={`${product.name}-${product.hsCode || 'unknown'}`}>
                      <td>{product.name}</td>
                      <td>{product.hsCode || 'Not known'}</td>
                    </tr>
                  )) : <tr><td colSpan={2}>No products added.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{data?.company.notes}</p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Leads</h2>
            <Button className="px-3 py-1" onClick={() => setLeadEditor('new')}>Add Lead</Button>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Name</th><th>Stage</th><th>Next call</th><th>Phone</th><th /></tr></thead>
              <tbody>{data?.leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.fullName}</td>
                  <td><BadgeStatus value={lead.stage} /></td>
                  <td>{dateLabel(lead.nextCallDate)}</td>
                  <td>{lead.phone || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button className="bg-emerald-600 px-2 py-1 hover:bg-emerald-700" onClick={() => startPhoneCall(lead)} disabled={!lead.phone}>
                        <Phone size={14} /> Call
                      </Button>
                      <Button className="bg-slate-900 px-2 py-1" onClick={() => setLeadEditor(lead)}>Edit</Button>
                      <Button className="bg-red-600 px-2 py-1 hover:bg-red-700" onClick={() => void deleteLead(lead._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Contacts</h2>
            <Button className="px-3 py-1" onClick={() => setContactEditor('new')}>Add Contact</Button>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Relation</th><th>Linked leads</th><th /></tr></thead>
              <tbody>{data?.contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.fullName}</td>
                  <td>{contact.phone}</td>
                  <td><BadgeStatus value={contact.relationType} /></td>
                  <td>{contact.linkedLeads?.map((lead) => lead.fullName).join(', ') || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button className="bg-slate-900 px-2 py-1" onClick={() => setContactEditor(contact)}>Edit</Button>
                      <Button className="bg-red-600 px-2 py-1 hover:bg-red-700" onClick={() => void deleteContact(contact._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Follow-up history</h2>
          <CallLogTimeline logs={data?.callLogs || []} />
        </section>
      </div>
      {callLead && (
        <LogCallModal
          leadId={callLead._id}
          initialCalledAt={callStartedAt || undefined}
          initialDurationSeconds={callDuration}
          title={callStartedAt ? `Add remarks for ${callLead.fullName}` : `Log call for ${callLead.fullName}`}
          onClose={closeCallModal}
          onSaved={() => void refetch()}
        />
      )}
      {isEditing && data?.company && (
        <AddCompanyModal
          company={data.company}
          onClose={() => setIsEditing(false)}
          onSaved={() => void refetch()}
        />
      )}
      {leadEditor && data?.company && (
        <LeadEditor
          companyId={data.company._id}
          lead={leadEditor === 'new' ? null : leadEditor}
          onClose={() => setLeadEditor(null)}
          onSaved={() => void refetch()}
        />
      )}
      {contactEditor && data?.company && (
        <ContactEditor
          companyId={data.company._id}
          contact={contactEditor === 'new' ? null : contactEditor}
          leads={data.leads}
          onClose={() => setContactEditor(null)}
          onSaved={() => void refetch()}
        />
      )}
    </>
  );
}
