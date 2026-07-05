import { Plus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../lib/axios';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useApi } from '../hooks/useApi';
import type { User } from '../types';
import { useState } from 'react';

export default function UsersPage() {
  const { user } = useOutletContext<{ user: User | null }>();
  const { data, refetch } = useApi<User[]>('/users');
  const [open, setOpen] = useState(false);
  if (user?.role !== 'ADMIN') return <><TopBar title="Users" /><p className="p-4 md:p-6">Admin access required.</p></>;

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/users', { name: form.get('name'), email: form.get('email'), password: form.get('password'), role: form.get('role') });
    setOpen(false);
    void refetch();
  }

  async function toggle(item: User) {
    await api.put(`/users/${item._id || item.id}`, { name: item.name, role: item.role, isActive: !item.isActive });
    void refetch();
  }

  return (
    <>
      <TopBar title="Users" actions={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add User</Button>} />
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th /></tr></thead>
            <tbody>{data?.map((item) => <tr key={item._id || item.id}><td>{item.name}</td><td>{item.email}</td><td><BadgeStatus value={item.role} /></td><td>{item.isActive ? 'Active' : 'Inactive'}</td><td>{item.createdAt?.slice(0, 10)}</td><td><Button className="bg-slate-900 px-2 py-1" onClick={() => void toggle(item)}>Toggle</Button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      {open && (
        <Modal title="Add user" onClose={() => setOpen(false)}>
          <form className="grid gap-4" onSubmit={(event) => void create(event)}>
            <input name="name" required placeholder="Name" />
            <input name="email" type="email" required placeholder="Email" />
            <input name="password" type="password" required placeholder="Password" />
            <select name="role" defaultValue="AGENT"><option value="AGENT">Agent</option><option value="ADMIN">Admin</option></select>
            <Button>Save user</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
