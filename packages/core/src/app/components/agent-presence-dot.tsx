import type { AgentPresenceState } from '@/lib/agent-presence';
import { cn } from '@/lib/utils';

export function AgentPresenceDot({ state }: { state: AgentPresenceState }) {
  return (
    <span aria-hidden className="relative flex size-1.5 items-center justify-center">
      {state === 'active' && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
      )}
      <span
        className={cn(
          'relative inline-flex size-1.5 rounded-full',
          state === 'unreachable' ? 'bg-rose-500' : 'bg-emerald-500',
        )}
      />
    </span>
  );
}
