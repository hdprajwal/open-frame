import { Agents } from '@/components/landing/agents';
import { Anatomy } from '@/components/landing/anatomy';
import { Assets } from '@/components/landing/assets';
import { Audiences } from '@/components/landing/audiences';
import { FAQ, faqs } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { Formats } from '@/components/landing/formats';
import { GetStarted } from '@/components/landing/get-started';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Inspector } from '@/components/landing/inspector';
import { LiveDemo } from '@/components/landing/live-demo';
import { Nav } from '@/components/landing/nav';
import { appName, gitConfig, siteUrl } from '@/lib/shared';

const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const description =
  'Make slides, LinkedIn carousels, story graphics, YouTube thumbnails, OG images, and X post images with React and a coding agent. Every page is code, versioned in your repo.';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url: siteUrl,
    description,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appName,
    url: siteUrl,
    logo: `${siteUrl}/open-frame.png`,
    sameAs: [repoUrl],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: appName,
    description,
    codeRepository: repoUrl,
    programmingLanguage: 'TypeScript',
    url: siteUrl,
    license: `${repoUrl}/blob/${gitConfig.branch}/LICENSE`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appName,
    description,
    url: siteUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, macOS, Linux, Windows',
    softwareRequirements: 'Node.js, React',
    license: `${repoUrl}/blob/${gitConfig.branch}/LICENSE`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Author a deck with open-frame',
    description:
      'Scaffold an open-frame workspace, ask an AI agent to draft pages in any format, then iterate visually in the browser.',
    totalTime: 'PT2M',
    supply: [
      { '@type': 'HowToSupply', name: 'Node.js 18+' },
      { '@type': 'HowToSupply', name: 'An AI coding agent (Claude Code, Cursor, Codex, …)' },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Spin up a workspace',
        text: 'Run npx @open-frame/cli init my-studio to scaffold the workspace. Every deck, carousel, and thumbnail you make lives inside it.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Ask your agent',
        text: 'Use a slash command like /create-frame and your agent drafts pages as React components in the format you pick.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Edit, comment, apply',
        text: 'Click any element to tweak it visually, or leave an @frame-comment marker and run /apply-comments to let the agent rewrite the source.',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is built from static, server-only constants
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <LiveDemo />
        <HowItWorks />
        <Anatomy />
        <Formats />
        <Inspector />
        <Assets />
        <Agents />
        <Audiences />
        <FAQ />
        <GetStarted />
      </main>
      <Footer />
    </>
  );
}
