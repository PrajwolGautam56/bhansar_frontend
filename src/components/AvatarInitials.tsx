import { cn, initials } from '../lib/utils';

export function AvatarInitials({ name, className }: { name?: string; className?: string }) {
  return <div className={cn('grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand', className)}>{initials(name)}</div>;
}
