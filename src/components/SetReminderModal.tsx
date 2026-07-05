import api from '../lib/axios';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export function SetReminderModal({ leadId, onClose, onSaved }: { leadId?: string; onClose: () => void; onSaved?: () => void }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/reminders', {
      lead: leadId || form.get('lead'),
      reminderDate: form.get('reminderDate'),
      note: form.get('note')
    });
    onSaved?.();
    onClose();
  }

  return (
    <Modal title="Set reminder" onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
        {!leadId && <input name="lead" required placeholder="Lead ID" />}
        <input name="reminderDate" required type="date" />
        <textarea name="note" placeholder="Reminder note" />
        <div className="flex justify-end">
          <Button>Save reminder</Button>
        </div>
      </form>
    </Modal>
  );
}
