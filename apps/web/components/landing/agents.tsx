type Agent = {
  name: string;
  /** asset file stem; if no theme variants, `variants: false` */
  file: string;
  variants: boolean;
};

const agents: Agent[] = [
  { name: 'Claude', file: 'claude', variants: false },
  { name: 'Codex', file: 'codex', variants: true },
  { name: 'Cursor', file: 'cursor', variants: true },
  { name: 'Gemini CLI', file: 'gemini', variants: false },
  { name: 'OpenCode', file: 'opencode', variants: true },
  { name: 'Windsurf', file: 'windsurf', variants: true },
  { name: 'Zed', file: 'zed', variants: true },
];

export function Agents() {
  // double the list so the marquee loops seamlessly
  const track = [...agents, ...agents];

  return (
    <section id="agents" className="relative overflow-hidden">
      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-12">
          <p className="caption mb-3">Agents</p>
          <h2 className="font-sans text-18 font-medium leading-1.56">
            Bring your own agent. Anything that edits React works.
          </h2>
        </div>

        <div
          className="relative"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          }}
        >
          <div className="marquee-track py-10 will-change-transform">
            {track.map((agent, i) => (
              <span key={`${agent.file}-${i}`} className="inline-flex items-center gap-4">
                <AgentLogo agent={agent} />
                <span className="font-sans text-ink text-24 -tracking-2">{agent.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentLogo({ agent }: { agent: Agent }) {
  const alt = agent.name;
  const cls = 'h-7 md:h-8.5 lg:h-10 w-auto object-contain shrink-0';

  const file = agent.variants ? `${agent.file}-light` : agent.file;
  return <img src={`/assets/${file}.svg`} alt={alt} className={cls} />;
}
