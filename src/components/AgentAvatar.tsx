import type { AgentMeta } from '@/lib/types';

export function AgentAvatar({ agent }: { agent: AgentMeta }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${agent.theme} text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.22)]`}
      aria-hidden="true"
    >
      {agent.persona.name.slice(0, 1)}
    </div>
  );
}
