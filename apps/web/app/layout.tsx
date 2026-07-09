import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Rubik } from 'next/font/google';
import { appName, gitConfig, siteUrl } from '@/lib/shared';

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const title = `${appName} — the content studio built for agents`;
const description =
  'Make slides, LinkedIn carousels, story graphics, YouTube thumbnails, OG images, and X post images with React and a coding agent. Every page is code, versioned in your repo.';

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s — ${appName}`,
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  keywords: [
    'open-frame',
    'slides',
    'LinkedIn carousel',
    'YouTube thumbnail',
    'OG image generator',
    'presentation framework',
    'React slides',
    'AI agents',
    'Claude Code',
    'slides as code',
    'content studio',
  ],
  authors: [{ name: gitConfig.user, url: `https://github.com/${gitConfig.user}` }],
  creator: gitConfig.user,
  publisher: appName,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title,
    description,
    type: 'website',
    url: siteUrl,
    siteName: appName,
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: `${appName} — the content studio built for agents`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1814' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.className} ${rubik.variable} ${jetbrains.variable}`}
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
