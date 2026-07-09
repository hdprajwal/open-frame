import {
  Clapperboard,
  GitBranch,
  GraduationCap,
  type LucideIcon,
  Megaphone,
  Presentation,
  Users,
} from 'lucide-react';
import Link from 'next/link';

type Audience = {
  icon: LucideIcon;
  title: string;
  items: string[];
};

const audiences: Audience[] = [
  {
    icon: Presentation,
    title: 'Speakers',
    items: ['Conference talks', 'Meetup decks', 'Workshop slides'],
  },
  {
    icon: Clapperboard,
    title: 'Creators',
    items: ['YouTube thumbnails', 'LinkedIn carousels', 'Instagram stories'],
  },
  {
    icon: GitBranch,
    title: 'Developers',
    items: [
      'Decks versioned in your repo',
      'Slides reviewed in pull requests',
      'Themes shared as components',
    ],
  },
  {
    icon: Megaphone,
    title: 'Marketers',
    items: ['Launch carousels', 'X post images', 'OG images for link previews'],
  },
  {
    icon: GraduationCap,
    title: 'Educators',
    items: ['Lecture slides', 'PDF handouts to share', 'Reusable course decks'],
  },
  {
    icon: Users,
    title: 'Teams',
    items: [
      'One workspace for every format',
      'A consistent brand, in code',
      'Static sites anyone can host',
    ],
  },
];

export function Audiences() {
  return (
    <section id="audiences" className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 lg:py-22">
        <p className="caption mb-3">Use cases</p>
        <h2 className="text-28 sm:text-34 font-light tracking-tight leading-1.15 mb-2">
          Designed for you
        </h2>
        <p className="max-w-560 text-16 leading-normal text-body mb-10 sm:mb-14">
          Start from a prompt, or open the demo workspace and make it yours.
        </p>

        <div className="rounded-12 border border-hairline bg-canvas p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {audiences.map((a) => (
              <div key={a.title}>
                <span className="inline-flex size-9 items-center justify-center rounded-10 bg-accent-soft text-accent-deep">
                  <a.icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-3 text-16 font-medium leading-normal">{a.title}</h3>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {a.items.map((item) => (
                    <li key={item} className="text-14 leading-1.43 text-body">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href="/docs"
            className="mt-10 inline-flex items-center justify-center h-9 rounded-full bg-accent px-5 text-on-primary font-mono text-13 font-medium uppercase -tracking-2 transition duration-200 hover:bg-accent-deep hover:shadow-lg hover:-translate-y-0.5 active:scale-98 motion-reduce:transform-none"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
