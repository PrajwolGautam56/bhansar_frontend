import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { useApi } from '../hooks/useApi';
import { dateTimeLabel } from '../lib/utils';
import type { CallLog, Paginated } from '../types';

function durationLabel(seconds?: number) {
  if (!seconds && seconds !== 0) return '-';
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function FollowUpsPage() {
  const { data } = useApi<Paginated<CallLog>>('/call-logs');
  return (
    <>
      <TopBar title="Follow-ups" />
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table>
            <thead><tr><th>Date</th><th>Duration</th><th>Lead</th><th>Company</th><th>Called by</th><th>Outcome</th><th>Remarks</th><th>Next action</th></tr></thead>
            <tbody>{data?.items.map((log) => <tr key={log._id}><td>{dateTimeLabel(log.calledAt)}</td><td>{durationLabel(log.callDurationSeconds)}</td><td>{log.lead?.fullName}</td><td>{log.lead?.company?.name}</td><td>{log.calledBy?.name}</td><td><BadgeStatus value={log.outcome} /></td><td>{log.remarks}</td><td>{log.nextAction}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
