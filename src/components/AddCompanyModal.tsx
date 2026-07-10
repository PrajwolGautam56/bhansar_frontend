import { useEffect, useState } from 'react';
import api from '../lib/axios';
import type { Company, User } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface ProductRow {
  name: string;
  hsCode: string;
}

interface LeadRow {
  fullName: string;
  phone: string;
  email: string;
  designation: string;
  stage: string;
  nextCallDate: string;
  mutualPerson: string;
  assignedTo: string;
  remarks: string;
}

interface ContactRow {
  fullName: string;
  phone: string;
  email: string;
  designation: string;
  relationType: string;
  linkToCreatedLeads: boolean;
  notes: string;
}

interface TransactionRow {
  startDate: string;
  endDate: string;
  amount: string;
  currency: string;
  notes: string;
}

const blankProduct = (): ProductRow => ({ name: '', hsCode: '' });
const blankLead = (): LeadRow => ({ fullName: '', phone: '', email: '', designation: '', stage: 'NEW', nextCallDate: '', mutualPerson: '', assignedTo: '', remarks: '' });
const blankContact = (): ContactRow => ({ fullName: '', phone: '', email: '', designation: '', relationType: 'LEAD_CONTACT', linkToCreatedLeads: false, notes: '' });
const blankTransaction = (): TransactionRow => ({ startDate: '', endDate: '', amount: '', currency: 'NPR', notes: '' });

function dateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

export function AddCompanyModal({
  company,
  onClose,
  onSaved
}: {
  company?: Company;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const isEdit = Boolean(company?._id);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<ProductRow[]>(
    company?.importProductDetails?.length
      ? company.importProductDetails.map((item) => ({ name: item.name, hsCode: item.hsCode || '' }))
      : company?.importProducts?.length
        ? company.importProducts.map((name) => ({ name, hsCode: '' }))
        : [blankProduct()]
  );
  const [leads, setLeads] = useState<LeadRow[]>([blankLead()]);
  const [contacts, setContacts] = useState<ContactRow[]>([blankContact()]);
  const [transactions, setTransactions] = useState<TransactionRow[]>(
    company?.importTransactions?.length
      ? company.importTransactions.map((item) => ({
          startDate: dateInput(item.startDate),
          endDate: dateInput(item.endDate),
          amount: item.amount ? String(item.amount) : '',
          currency: item.currency || 'NPR',
          notes: item.notes || ''
        }))
      : [blankTransaction()]
  );

  useEffect(() => {
    void api.get<User[]>('/users').then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  function updateProduct(index: number, patch: Partial<ProductRow>) {
    setProducts((current) => current.map((product, itemIndex) => (itemIndex === index ? { ...product, ...patch } : product)));
  }

  function updateLead(index: number, patch: Partial<LeadRow>) {
    setLeads((current) => current.map((lead, itemIndex) => (itemIndex === index ? { ...lead, ...patch } : lead)));
  }

  function updateContact(index: number, patch: Partial<ContactRow>) {
    setContacts((current) => current.map((contact, itemIndex) => (itemIndex === index ? { ...contact, ...patch } : contact)));
  }

  function updateTransaction(index: number, patch: Partial<TransactionRow>) {
    setTransactions((current) => current.map((transaction, itemIndex) => (itemIndex === index ? { ...transaction, ...patch } : transaction)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const importProductDetails = products.map((item) => ({ name: item.name.trim(), hsCode: item.hsCode.trim() })).filter((item) => item.name);
    const payload: Record<string, unknown> = {
      name: form.get('name'),
      location: form.get('location'),
      district: form.get('district'),
      panNumber: form.get('panNumber'),
      eximCode: form.get('eximCode'),
      phoneNumbers: String(form.get('phoneNumbers') || '')
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
      ownerName: form.get('ownerName'),
      importProducts: importProductDetails.map((item) => item.name),
      importProductDetails,
      importFrequency: form.get('importFrequency') || undefined,
      entryPort: form.get('entryPort'),
      currentServiceProvider: form.get('currentServiceProvider'),
      importTransactions: transactions
        .filter((transaction) => transaction.startDate || transaction.endDate || transaction.amount)
        .map((transaction) => ({
          startDate: transaction.startDate || undefined,
          endDate: transaction.endDate || undefined,
          amount: transaction.amount ? Number(transaction.amount) : undefined,
          currency: transaction.currency || 'NPR',
          notes: transaction.notes
        })),
      status: form.get('status'),
      followUpDate: form.get('followUpDate') || undefined,
      workingSince: form.get('workingSince') || undefined,
      notes: form.get('notes')
    };

    if (!isEdit) {
      payload.leads = leads
        .filter((lead) => lead.fullName.trim())
        .map((lead) => ({
          ...lead,
          fullName: lead.fullName.trim(),
          nextCallDate: lead.nextCallDate || undefined,
          assignedTo: lead.assignedTo || undefined
        }));
      payload.contacts = contacts
        .filter((contact) => contact.fullName.trim())
        .map((contact) => ({ ...contact, fullName: contact.fullName.trim() }));
    }

    if (isEdit) await api.put(`/companies/${company!._id}`, payload);
    else await api.post('/companies', payload);
    onSaved?.();
    onClose();
  }

  return (
    <Modal title={isEdit ? 'Edit company' : 'Add company'} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <input name="name" required placeholder="Company name" defaultValue={company?.name} />
        <input name="location" placeholder="Location / City" defaultValue={company?.location} />
        <input name="district" placeholder="District" defaultValue={company?.district} />
        <input name="panNumber" placeholder="PAN / VAT number" defaultValue={company?.panNumber} />
        <input name="eximCode" placeholder="EXIM code" defaultValue={company?.eximCode} />
        <input name="ownerName" placeholder="Owner / contact person" defaultValue={company?.ownerName} />
        <input name="phoneNumbers" placeholder="Phone numbers, comma separated" defaultValue={company?.phoneNumbers?.join(', ')} />

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Imported products and HS codes</label>
            <button type="button" className="text-sm font-semibold text-brand" onClick={() => setProducts((current) => [...current, blankProduct()])}>
              Add product
            </button>
          </div>
          {products.map((product, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
              <input value={product.name} onChange={(event) => updateProduct(index, { name: event.target.value })} placeholder="Product name" />
              <input value={product.hsCode} onChange={(event) => updateProduct(index, { hsCode: event.target.value })} placeholder="HS code, if known" />
              <button type="button" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200" onClick={() => setProducts((current) => (current.length === 1 ? [blankProduct()] : current.filter((_, itemIndex) => itemIndex !== index)))}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <select name="importFrequency" defaultValue={company?.importFrequency || ''}>
          <option value="">Import frequency</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="IRREGULAR">Irregular</option>
        </select>
        <input name="entryPort" placeholder="Entry port" defaultValue={company?.entryPort} />
        <input name="currentServiceProvider" placeholder="Current service provider" defaultValue={company?.currentServiceProvider} />
        <select name="status" defaultValue={company?.status || 'LEAD'}>
          <option value="LEAD">Lead</option>
          <option value="INTERESTED">Interested</option>
          <option value="ACTIVE_CLIENT">Active client</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <input name="followUpDate" type="date" defaultValue={dateInput(company?.followUpDate)} />
        <input name="workingSince" type="date" defaultValue={dateInput(company?.workingSince)} />
        <textarea name="notes" className="md:col-span-2" placeholder="Notes" defaultValue={company?.notes} />

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Import transaction history</label>
            <button type="button" className="text-sm font-semibold text-brand" onClick={() => setTransactions((current) => [...current, blankTransaction()])}>
              Add transaction
            </button>
          </div>
          {transactions.map((transaction, index) => (
            <div key={index} className="grid gap-2 rounded-md bg-slate-50 p-3 md:grid-cols-[150px_150px_1fr_100px_auto]">
              <input value={transaction.startDate} onChange={(event) => updateTransaction(index, { startDate: event.target.value })} type="date" title="Start date" />
              <input value={transaction.endDate} onChange={(event) => updateTransaction(index, { endDate: event.target.value })} type="date" title="End date" />
              <input value={transaction.amount} onChange={(event) => updateTransaction(index, { amount: event.target.value })} type="number" min="0" step="0.01" placeholder="Transaction amount" />
              <input value={transaction.currency} onChange={(event) => updateTransaction(index, { currency: event.target.value })} placeholder="Currency" />
              <button type="button" className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200" onClick={() => setTransactions((current) => (current.length === 1 ? [blankTransaction()] : current.filter((_, itemIndex) => itemIndex !== index)))}>
                Remove
              </button>
              <input className="md:col-span-5" value={transaction.notes} onChange={(event) => updateTransaction(index, { notes: event.target.value })} placeholder="Notes, source, or shipment detail" />
            </div>
          ))}
        </div>

        {!isEdit && (
          <>
            <div className="md:col-span-2 rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Add leads for this company</h3>
                <button type="button" className="text-sm font-semibold text-brand" onClick={() => setLeads((current) => [...current, blankLead()])}>
                  Add lead
                </button>
              </div>
              <div className="space-y-4">
                {leads.map((lead, index) => (
                  <div key={index} className="grid gap-3 rounded-md bg-slate-50 p-3 md:grid-cols-2">
                    <input value={lead.fullName} onChange={(event) => updateLead(index, { fullName: event.target.value })} placeholder="Lead full name" />
                    <input value={lead.phone} onChange={(event) => updateLead(index, { phone: event.target.value })} placeholder="Phone" />
                    <input value={lead.email} onChange={(event) => updateLead(index, { email: event.target.value })} placeholder="Email" />
                    <input value={lead.designation} onChange={(event) => updateLead(index, { designation: event.target.value })} placeholder="Designation" />
                    <select value={lead.stage} onChange={(event) => updateLead(index, { stage: event.target.value })}>
                      {['NEW', 'INTERESTED', 'NEGOTIATING', 'ONBOARDING', 'CLIENT', 'LOST'].map((stage) => <option key={stage}>{stage}</option>)}
                    </select>
                    <input value={lead.nextCallDate} onChange={(event) => updateLead(index, { nextCallDate: event.target.value })} type="date" />
                    <select value={lead.assignedTo} onChange={(event) => updateLead(index, { assignedTo: event.target.value })}>
                      <option value="">Assign agent</option>
                      {users.map((user) => <option key={user._id || user.id} value={user._id || user.id}>{user.name}</option>)}
                    </select>
                    <input value={lead.mutualPerson} onChange={(event) => updateLead(index, { mutualPerson: event.target.value })} placeholder="Mutual person" />
                    <textarea className="md:col-span-2" value={lead.remarks} onChange={(event) => updateLead(index, { remarks: event.target.value })} placeholder="Lead remarks" />
                    <button type="button" className="text-left text-sm font-semibold text-red-600" onClick={() => setLeads((current) => (current.length === 1 ? [blankLead()] : current.filter((_, itemIndex) => itemIndex !== index)))}>
                      Remove lead
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Add contacts for this company</h3>
                <button type="button" className="text-sm font-semibold text-brand" onClick={() => setContacts((current) => [...current, blankContact()])}>
                  Add contact
                </button>
              </div>
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="grid gap-3 rounded-md bg-slate-50 p-3 md:grid-cols-2">
                    <input value={contact.fullName} onChange={(event) => updateContact(index, { fullName: event.target.value })} placeholder="Contact full name" />
                    <input value={contact.phone} onChange={(event) => updateContact(index, { phone: event.target.value })} placeholder="Phone" />
                    <input value={contact.email} onChange={(event) => updateContact(index, { email: event.target.value })} placeholder="Email" />
                    <input value={contact.designation} onChange={(event) => updateContact(index, { designation: event.target.value })} placeholder="Designation" />
                    <select value={contact.relationType} onChange={(event) => updateContact(index, { relationType: event.target.value })}>
                      <option value="LEAD_CONTACT">Lead contact</option>
                      <option value="MUTUAL">Mutual</option>
                      <option value="CLIENT_REFERRAL">Client referral</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-600">
                      <input className="h-4 w-4" type="checkbox" checked={contact.linkToCreatedLeads} onChange={(event) => updateContact(index, { linkToCreatedLeads: event.target.checked })} />
                      Link to new leads above
                    </label>
                    <textarea className="md:col-span-2" value={contact.notes} onChange={(event) => updateContact(index, { notes: event.target.value })} placeholder="Contact notes" />
                    <button type="button" className="text-left text-sm font-semibold text-red-600" onClick={() => setContacts((current) => (current.length === 1 ? [blankContact()] : current.filter((_, itemIndex) => itemIndex !== index)))}>
                      Remove contact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="md:col-span-2 flex justify-end">
          <Button>{isEdit ? 'Update company' : 'Save company'}</Button>
        </div>
      </form>
    </Modal>
  );
}
