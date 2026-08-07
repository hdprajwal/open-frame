import { cn } from '@/lib/utils';

/** The open-frame mark: four chevrons opening away from an empty frame. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4', className)}
      role="img"
    >
      <title>open-frame</title>
      <path d="M8 8.5 12 4.5 16 8.5" />
      <path d="M8.5 8 4.5 12 8.5 16" />
      <path d="M15.5 8 19.5 12 15.5 16" />
      <path d="M8 15.5 12 19.5 16 15.5" />
    </svg>
  );
}
