import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import api from './lib/axios';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ContactsPage from './pages/ContactsPage';
import FollowUpsPage from './pages/FollowUpsPage';
import LeadsPage from './pages/LeadsPage';
import LoginPage from './pages/LoginPage';
import RemindersPage from './pages/RemindersPage';
import UsersPage from './pages/UsersPage';
import { useAuthStore } from './store/authStore';

function ProtectedLayout() {
  const { isAuthenticated, setUser, setToken, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null);
        navigate('/login');
      });
  }, [isAuthenticated, navigate, setToken, setUser]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
