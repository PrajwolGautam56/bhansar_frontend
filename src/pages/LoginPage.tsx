import { Package } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get('email')), String(form.get('password')));
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-2 text-brand">
          <Package size={28} />
          <div>
            <h1 className="text-xl font-bold">Bhansar CRM</h1>
            <p className="text-sm text-slate-500">Lead follow-up for customs agents</p>
          </div>
        </div>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="space-y-3">
          <input className="w-full" name="email" type="email" placeholder="Email" defaultValue="admin@bhansarcrm.local" required />
          <input className="w-full" name="password" type="password" placeholder="Password" defaultValue="Admin@12345" required />
          <Button className="w-full">Login</Button>
        </div>
      </form>
    </main>
  );
}
