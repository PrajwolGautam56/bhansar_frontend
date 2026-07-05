import { useEffect, useState } from 'react';
import api from '../lib/axios';
import type { Company, Lead, Paginated, User } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved?: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    void Promise.all([
      api.get<Paginated<Company>>('/companies?limit=100').then((res) => setCompanies(res.data.items)),
      api.get<User[]>('/users').then((res) => setUsers(res.data)).catch(() => setUsers([])),
      api.get<Paginated<Lead>>('/leads?limit=100').then((res) => setLeads(res.data.items))
    ]);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/leads', {
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      email: form.get('email'),
      designation: form.get('designation'),
      company: form.get('company') || undefined,
      stage: form.get('stage'),
      lastCalledDate: form.get('lastCalledDate') || undefined,
      nextCallDate: form.get('nextCallDate') || undefined,
      assignedTo: form.get('assignedTo') || undefined,
      mutualPerson: form.get('mutualPerson'),
      relatedLeads: form.getAll('relatedLeads'),
      remarks: form.get('remarks')
    });
    onSaved?.();
    onClose();
  }

  return (
    <Modal title="Add lead" onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <input name="fullName" required placeholder="Full name" />
        <input name="phone" placeholder="Phone" />
        <input name="email" type="email" placeholder="Email" />
        <input name="designation" placeholder="Designation / Role" />
        <select name="company" defaultValue="">
          <option value="">Company</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>{company.name}</option>
          ))}
        </select>
        <select name="stage" defaultValue="NEW">
          {['NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'].map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
        <input name="lastCalledDate" type="date" />
        <input name="nextCallDate" type="date" />
        <select name="assignedTo" defaultValue="">
          <option value="">Assigned agent</option>
          {users.map((user) => (
            <option key={user._id || user.id} value={user._id || user.id}>{user.name}</option>
          ))}
        </select>
        <input name="mutualPerson" placeholder="Who is the common contact?" />
        <select name="relatedLeads" multiple className="min-h-24">
          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>{lead.fullName}</option>
          ))}
        </select>
        <textarea name="remarks" className="md:col-span-2" placeholder="Remarks" />
        <div className="md:col-span-2 flex justify-end">
          <Button>Save lead</Button>
        </div>
      </form>
    </Modal>
  );
}
