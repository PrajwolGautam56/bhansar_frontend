import api from '../lib/axios';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useReminders } from '../hooks/useReminders';
import { dateLabel } from '../lib/utils';
import type { Reminder } from '../types';

function Section({ title, items, onDone }: { title: string; items: Reminder[]; onDone: (id: string) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4 font-semibold">{title}</div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((reminder) => (
          <div key={reminder._id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between"><p className="font-semibold">{reminder.lead?.fullName}</p><BadgeStatus value={reminder.urgency} /></div>
            <p className="text-sm text-slate-500">{reminder.lead?.company?.name} · {reminder.lead?.phone}</p>
            <p className="mt-2 text-sm">{dateLabel(reminder.reminderDate)}</p>
            <p className="text-sm text-slate-600">{reminder.note}</p>
            {!reminder.isDone && <Button className="mt-3 bg-slate-900 px-2 py-1" onClick={() => onDone(reminder._id)}>Mark done</Button>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RemindersPage() {
  const { data, refetch } = useReminders('?isDone=false');
  const reminders = data ?? [];
  async function markDone(id: string) {
    await api.put(`/reminders/${id}`, { isDone: true });
    void refetch();
  }
  return (
    <>
      <TopBar title="Reminders" />
      <div className="space-y-5 p-4 md:p-6">
        <Section title="Overdue" items={reminders.filter((item) => item.urgency === 'OVERDUE')} onDone={(id) => void markDone(id)} />
        <Section title="Today" items={reminders.filter((item) => item.urgency === 'TODAY')} onDone={(id) => void markDone(id)} />
        <Section title="Upcoming" items={reminders.filter((item) => item.urgency === 'UPCOMING')} onDone={(id) => void markDone(id)} />
      </div>
    </>
  );
}
