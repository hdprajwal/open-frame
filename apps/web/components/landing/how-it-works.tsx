import type { ReactNode } from 'react';

type Step = {
  num: string;
  kicker: string;
  title: string;
  body: string;
  code: {
    prompt: string;
    line: string;
    tail: ReactNode;
  };
};

const steps: Step[] = [
  {
    num: '01',
    kicker: 'scaffold',
    title: 'Spin up a workspace',
    body: 'Creates the workspace. Every deck, carousel, and thumbnail you make lives inside it.',
    code: {
      prompt: '$',
      line: 'npx @open-frame/cli init my-studio',
      tail: '✓ ready in 3s',
    },
  },
  {
    num: '02',
    kicker: 'author',
    title: 'Ask your agent',
    body: 'Your agent drafts pages as React components, in whatever format you pick.',
    code: {
      prompt: '›',
      line: '/create-slide a launch carousel',
      tail: <AgentRow />,
    },
  },
  {
    num: '03',
    kicker: 'iterate',
    title: 'Edit, comment, apply',
    body: 'Click any element to tweak it visually. Or leave a comment for the agent to apply.',
    code: {
      prompt: '›',
      line: '/apply-comment',
      tail: '✓ applied change',
    },
  },
];

const SLASH_COMMAND = /\/[a-z][a-z-]*/g;

function renderLine(line: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(SLASH_COMMAND)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(line.slice(last, start));
    const cmd = match[0];
    parts.push(
      <span key={`cmd-${start}`} className="font-medium text-ink">
        {cmd}
      </span>,
    );
    last = start + cmd.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <>{parts}</>;
}

function AgentRow() {
  const agents: [string, string][] = [
    ['claude.svg', 'Claude'],
    ['codex-dark.svg', 'Codex'],
    ['cursor-dark.svg', 'Cursor'],
    ['gemini.svg', 'Gemini CLI'],
  ];
  const cls = 'agent-mono h-3.5 w-auto object-contain shrink-0';
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 normal-case tracking-normal">
      {agents.map(([file, name]) => (
        <img key={file} src={`/assets/${file}`} alt={name} className={cls} />
      ))}
      <span className="text-12 tracking-8 uppercase text-mute">...</span>
    </span>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 lg:py-24">
        <p className="caption mb-3">Workflow</p>
        <h2 className="text-28 sm:text-34 font-light tracking-tight leading-1.15 mb-10 sm:mb-14">
          Pages as code. Written by agents.
        </h2>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline rounded-12 overflow-hidden shadow-sm">
          {steps.map((s) => (
            <li key={s.num} className="group relative p-6 sm:p-8 bg-canvas flex flex-col gap-6">
              <span className="font-mono text-12 tracking-8 uppercase text-mute">
                {s.num} · {s.kicker}
              </span>

              <div>
                <h3 className="text-20 font-medium leading-1.4">{s.title}</h3>
                <p className="mt-2 text-14 leading-normal text-body max-w-[36ch]">{s.body}</p>
              </div>

              <div className="mt-auto rounded-8 bg-surface p-4 font-mono text-13">
                <div className="flex items-center gap-2">
                  <span className="text-mute">{s.code.prompt}</span>
                  <span className="text-ink truncate">{renderLine(s.code.line)}</span>
                </div>
                <div className="mt-3 text-12 tracking-8 uppercase text-mute">{s.code.tail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
