import { dateTimeLabel } from '../lib/utils';
import type { CallLog } from '../types';
import { BadgeStatus } from './BadgeStatus';

function durationLabel(seconds?: number) {
  if (!seconds && seconds !== 0) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function CallLogTimeline({ logs }: { logs: CallLog[] }) {
  if (!logs.length) return <p className="text-sm text-slate-500">No call logs yet.</p>;
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log._id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{dateTimeLabel(log.calledAt)} by {log.calledBy?.name || 'Agent'}</p>
            <BadgeStatus value={log.outcome} />
          </div>
          {durationLabel(log.callDurationSeconds) && <p className="mt-1 text-xs font-medium text-slate-500">Duration: {durationLabel(log.callDurationSeconds)}</p>}
          <p className="mt-2 text-sm text-slate-600">{log.remarks || '-'}</p>
          {log.nextAction && <p className="mt-1 text-xs text-slate-500">Next: {log.nextAction}</p>}
        </div>
      ))}
    </div>
  );
}
