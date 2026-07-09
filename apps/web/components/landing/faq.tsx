import { ChevronDown } from 'lucide-react';

export type QA = { q: string; a: string };

export const faqs: QA[] = [
  {
    q: 'What is open-frame?',
    a: 'open-frame is a studio for making slides, LinkedIn carousels, story graphics, YouTube thumbnails, OG images, and X post images with React and a coding agent. Every page is a .tsx file rendered on a canvas sized for its format. Decks live in your repo, so they are versioned, reviewable in pull requests, and yours.',
  },
  {
    q: 'What formats does open-frame support?',
    a: "Seven presets: slide (1920×1080), carousel (1080×1080), portrait (1080×1350), story (1080×1920), thumbnail (1280×720), OG image (1200×630), and X post (1600×900). If none of those fit, set a custom canvas with any width and height. Every page in a deck renders, previews, and exports at the deck's size.",
  },
  {
    q: 'How is open-frame different from Reveal.js, Slidev, or Canva?',
    a: 'Slide frameworks like Reveal.js and Slidev lean on Markdown or a DSL, and they only make slides. Design tools like Canva are visual editors an agent cannot drive. open-frame gives every page a full React component on a fixed canvas, so an agent can write it, you can review it like any other code, and one workspace covers slides, carousels, stories, and thumbnails.',
  },
  {
    q: 'Which AI coding agents work with open-frame?',
    a: 'Any agent that edits React works. open-frame ships skills for Claude Code, and the same files are editable by Codex, Cursor, Gemini CLI, OpenCode, Windsurf, Zed, and any other tool that can read and write .tsx files. There is no proprietary protocol. Agents work because pages are just code.',
  },
  {
    q: 'Do I need to know React to use open-frame?',
    a: 'No. Describe what you want in plain language and your agent writes the React for you. From there you iterate visually with the in-browser inspector, or leave comments on elements for the agent to apply. Knowing React helps when you want full control, but it is not required.',
  },
  {
    q: 'Can I export what I make?',
    a: "Yes. Export any deck as a PDF, a PPTX, or PNG images, each sized to the deck's format. You can also build a self-contained static site and host it on Vercel, Cloudflare Pages, Netlify, or any static host.",
  },
  {
    q: 'Is open-frame open source?',
    a: 'Yes, open-frame is MIT-licensed. Source lives at github.com/hdprajwal/open-frame. It is built on open-slide by Yiwei Ho, which pioneered the agent-first authoring model; open-frame adds multi-format canvases and format-correct exports on top.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-12 sm:py-16 lg:py-[88px]">
        <p className="caption mb-3">FAQ</p>
        <h2 className="text-[28px] sm:text-[34px] font-light tracking-tight leading-[1.15] mb-8 sm:mb-10">
          Questions & answers
        </h2>

        <div className=" border-b border-[color:var(--color-hairline)]">
          {faqs.map((item, idx) => (
            <details
              key={item.q}
              open={idx === 0}
              className="group border-t border-[color:var(--color-hairline)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <span className="text-[18px] font-medium leading-[1.56]">{item.q}</span>
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-[color:var(--color-body)] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 text-[16px] leading-[1.5] text-[color:var(--color-body)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
