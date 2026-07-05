import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button className="bg-slate-100 px-2 text-slate-700 hover:bg-slate-200" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="p-4 md:p-5">{children}</div>
      </div>
    </div>
  );
}
