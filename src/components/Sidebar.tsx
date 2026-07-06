import { Building2, CalendarClock, LayoutDashboard, LogOut, Package, PhoneCall, Users, UserSquare2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AvatarInitials } from './AvatarInitials';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: UserSquare2 },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/reminders', label: 'Reminders', icon: CalendarClock },
  { href: '/follow-ups', label: 'Follow-ups', icon: PhoneCall }
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const items = user?.role === 'ADMIN' ? [...nav, { href: '/users', label: 'Users', icon: Users }] : nav;

  return (
    <aside className="md:sticky md:top-0 md:flex md:h-screen md:w-[220px] md:shrink-0 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 font-bold text-brand">
        <Package size={22} />
        Bhansar CRM
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 shadow-soft md:static md:block md:flex-1 md:space-y-1 md:overflow-visible md:border-t-0 md:px-3 md:py-4 md:shadow-none">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex min-w-[72px] flex-col items-center gap-1 rounded-md border-l-0 px-2 py-2 text-[11px] font-medium md:min-w-0 md:flex-row md:gap-3 md:border-l-4 md:px-3 md:text-sm ${
                isActive ? 'border-brand bg-brand/10 text-brand' : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <item.icon size={18} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="hidden border-t border-slate-100 p-4 md:block">
        <div className="flex items-center gap-3">
          <AvatarInitials name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button className="mt-3 text-xs font-semibold text-slate-500 hover:text-brand" onClick={() => void logout()}>
          <span className="inline-flex items-center gap-1"><LogOut size={14} /> Logout</span>
        </button>
      </div>
    </aside>
  );
}
