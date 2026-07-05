import api from '../lib/axios';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

function toDateTimeLocal(value?: Date) {
  const date = value || new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function parseDuration(value: FormDataEntryValue | null) {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (raw.includes(':')) {
    const [minutes, seconds = '0'] = raw.split(':');
    return Number(minutes) * 60 + Number(seconds);
  }
  return Number(raw) * 60;
}

export function LogCallModal({
  leadId,
  onClose,
  onSaved,
  initialCalledAt,
  initialDurationSeconds,
  title = 'Log call'
}: {
  leadId?: string;
  onClose: () => void;
  onSaved?: () => void;
  initialCalledAt?: Date;
  initialDurationSeconds?: number;
  title?: string;
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/call-logs', {
      leadId: leadId || form.get('leadId'),
      outcome: form.get('outcome'),
      remarks: form.get('remarks'),
      calledAt: form.get('calledAt'),
      callDurationSeconds: parseDuration(form.get('callDuration')),
      nextAction: form.get('nextAction'),
      nextActionDate: form.get('nextActionDate') || undefined
    });
    onSaved?.();
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
        {!leadId && <input name="leadId" required placeholder="Lead ID" />}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-600">Call date & time</span>
            <input name="calledAt" type="datetime-local" defaultValue={toDateTimeLocal(initialCalledAt)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-600">Duration</span>
            <input name="callDuration" placeholder="Minutes or mm:ss" defaultValue={formatDuration(initialDurationSeconds)} />
          </label>
        </div>
        <select name="outcome" defaultValue="NEUTRAL">
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
          <option value="NO_ANSWER">No answer</option>
        </select>
        <textarea name="remarks" placeholder="Remarks" />
        <input name="nextAction" placeholder="Next action" />
        <input name="nextActionDate" type="date" />
        <div className="flex justify-end">
          <Button>Save call log</Button>
        </div>
      </form>
    </Modal>
  );
}
