import { useEffect, useState } from 'react';
import api from '../lib/axios';
import type { Company, Lead, Paginated } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export function AddContactModal({ onClose, onSaved }: { onClose: () => void; onSaved?: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    void Promise.all([
      api.get<Paginated<Company>>('/companies?limit=100').then((res) => setCompanies(res.data.items)),
      api.get<Paginated<Lead>>('/leads?limit=100').then((res) => setLeads(res.data.items))
    ]);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/contacts', {
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      email: form.get('email'),
      designation: form.get('designation'),
      company: form.get('company') || undefined,
      relationType: form.get('relationType'),
      linkedLeads: form.getAll('linkedLeads'),
      notes: form.get('notes')
    });
    onSaved?.();
    onClose();
  }

  return (
    <Modal title="Add contact" onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <input name="fullName" required placeholder="Full name" />
        <input name="phone" placeholder="Phone" />
        <input name="email" type="email" placeholder="Email" />
        <input name="designation" placeholder="Designation" />
        <select name="company" defaultValue="">
          <option value="">Company</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>{company.name}</option>
          ))}
        </select>
        <select name="relationType" defaultValue="LEAD_CONTACT">
          <option value="LEAD_CONTACT">Lead contact</option>
          <option value="MUTUAL">Mutual</option>
          <option value="CLIENT_REFERRAL">Client referral</option>
        </select>
        <select name="linkedLeads" multiple className="min-h-24 md:col-span-2">
          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>{lead.fullName}</option>
          ))}
        </select>
        <textarea name="notes" className="md:col-span-2" placeholder="Notes" />
        <div className="md:col-span-2 flex justify-end">
          <Button>Save contact</Button>
        </div>
      </form>
    </Modal>
  );
}
