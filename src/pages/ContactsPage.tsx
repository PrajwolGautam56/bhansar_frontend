import { Plus } from 'lucide-react';
import { AddContactModal } from '../components/AddContactModal';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useUiStore } from '../store/uiStore';
import type { Contact } from '../types';

export default function ContactsPage() {
  const { data, refetch } = useApi<Contact[]>('/contacts');
  const { activeModal, openModal, closeModal } = useUiStore();
  return (
    <>
      <TopBar title="Contacts" actions={<Button onClick={() => openModal('contact')}><Plus size={16} /> Add Contact</Button>} />
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table>
            <thead><tr><th>Name</th><th>Designation</th><th>Company</th><th>Phone</th><th>Relation</th><th>Linked leads</th><th>Notes</th></tr></thead>
            <tbody>{data?.map((contact) => <tr key={contact._id}><td>{contact.fullName}</td><td>{contact.designation}</td><td>{contact.company?.name}</td><td>{contact.phone}</td><td><BadgeStatus value={contact.relationType} /></td><td>{contact.linkedLeads?.length || 0}</td><td>{contact.notes}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      {activeModal === 'contact' && <AddContactModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
