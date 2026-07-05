import { Building2, CalendarClock, Percent, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { BadgeStatus } from '../components/BadgeStatus';
import { StatsCard } from '../components/StatsCard';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { dateLabel, dueColor } from '../lib/utils';
import { useApi } from '../hooks/useApi';
import type { CallLog, Lead } from '../types';

interface DashboardStats {
  totalLeads: number;
  totalCompanies: number;
  callsDueToday: number;
  overdueReminders: number;
  conversionRate: number;
  upcomingFollowUps: Lead[];
  recentCallLogs: CallLog[];
}

export default function DashboardPage() {
  const { data, loading } = useApi<DashboardStats>('/dashboard/stats');

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard title="Total Leads" value={data?.totalLeads ?? 0} icon={<Users size={22} />} />
          <StatsCard title="Companies" value={data?.totalCompanies ?? 0} icon={<Building2 size={22} />} />
          <StatsCard title="Calls Today" value={data?.callsDueToday ?? 0} icon={<CalendarClock size={22} />} />
          <StatsCard title="Conversion" value={`${data?.conversionRate ?? 0}%`} icon={<Percent size={22} />} />
        </div>
        {!!data?.overdueReminders && <div className="rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-800">{data.overdueReminders} overdue reminders need attention.</div>}
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 font-semibold">Upcoming follow-ups</div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Lead</th><th>Company</th><th>Next call</th><th>Agent</th><th>Stage</th><th /></tr></thead>
              <tbody>
                {loading && <tr><td colSpan={6}>Loading...</td></tr>}
                {data?.upcomingFollowUps.map((lead) => (
                  <tr key={lead._id}>
                    <td><p className="font-semibold">{lead.fullName}</p><p className="text-xs text-slate-500">{lead.mutualPerson}</p></td>
                    <td>{lead.company?.name || '-'}</td>
                    <td className={dueColor(lead.nextCallDate)}>{dateLabel(lead.nextCallDate)} {dayjs(lead.nextCallDate).isSame(dayjs(), 'day') ? '(today)' : ''}</td>
                    <td>{lead.assignedTo?.name || '-'}</td>
                    <td><BadgeStatus value={lead.stage} /></td>
                    <td><Button className="bg-slate-900 px-2 py-1">Log call</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Recent call logs</h2>
          <div className="space-y-2">
            {data?.recentCallLogs.map((log) => (
              <div key={log._id} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span>{log.lead?.fullName} · {log.remarks || 'No remarks'}</span>
                <BadgeStatus value={log.outcome} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
