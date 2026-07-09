import Image from 'next/image';
import { FadeGrid } from './fade-grid';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--color-hairline)] bg-[color:var(--color-canvas)]">
      <FadeGrid corner="bottom-left" />
      <div className="relative mx-auto max-w-[1080px] px-5 sm:px-8 py-10 sm:py-14 grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[13px]">
            <Image
              src="/open-frame.png"
              alt=""
              aria-hidden
              width={24}
              height={24}
              className="h-6 w-6 rounded-[4px]"
            />
            <span className="tracking-[-0.01em]">open-frame</span>
          </div>
          <p className="text-[14px] leading-[1.6] text-[color:var(--color-body)] max-w-[38ch]">
            A studio for slides, carousels, stories, thumbnails, and OG images. Made with React and
            your coding agent. MIT licensed.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            ['Live demo', '#demo'],
            ['Docs', '/docs'],
            ['FAQ', '#faq'],
          ]}
        />
        <FooterCol
          title="Packages"
          links={[
            ['@open-frame/core', 'https://github.com/hdprajwal/open-frame/tree/main/packages/core'],
            ['@open-frame/cli', 'https://github.com/hdprajwal/open-frame/tree/main/packages/cli'],
          ]}
        />
        <FooterCol
          title="Elsewhere"
          links={[
            ['GitHub', 'https://github.com/hdprajwal/open-frame'],
            ['Issues', 'https://github.com/hdprajwal/open-frame/issues'],
            ['open-slide', 'https://github.com/1weiho/open-slide'],
          ]}
        />
      </div>

      <div className="relative border-t border-[color:var(--color-hairline)]">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 text-[12px] text-[color:var(--color-body)]">
          <span>© {new Date().getFullYear()} open-frame · MIT licensed</span>
          <span>
            Built on open-slide by{' '}
            <a
              href="https://1wei.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink)] underline underline-offset-4"
            >
              Yiwei
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="col-span-6 md:col-span-4 lg:col-span-2 flex flex-col gap-4">
      <div className="caption">{title}</div>
      <ul className="flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-[14px] text-[color:var(--color-body)] hover:text-[color:var(--color-ink)] transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
