import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildHtml, findHtmlAssetUrls } from './export-html';

afterEach(() => {
  vi.unstubAllGlobals();
});

type FakeStep = {
  attrs: Record<string, string>;
  style: Record<string, string>;
  offsetWidth: number;
  setAttribute: (k: string, v: string) => void;
};

type FakeVideo = {
  autoplay: boolean;
  currentTime: number;
  paused: boolean;
  pause: () => void;
  play: () => Promise<void>;
};

type FakePage = {
  hidden: boolean;
  steps: FakeStep[];
  videos: FakeVideo[];
  querySelectorAll: (sel: string) => unknown[];
};

function makeStep(): FakeStep {
  const step: FakeStep = {
    attrs: { 'data-of-step': 'revealed' },
    style: { transition: 'opacity 180ms' },
    offsetWidth: 0,
    setAttribute: (k, v) => {
      step.attrs[k] = v;
    },
  };
  return step;
}

function makeVideo(autoplay: boolean): FakeVideo {
  const video: FakeVideo = {
    autoplay,
    currentTime: 3,
    paused: true,
    pause: () => {
      video.paused = true;
    },
    play: () => {
      video.paused = false;
      return Promise.resolve();
    },
  };
  return video;
}

function makePage(stepCount: number, videos: FakeVideo[] = []): FakePage {
  const page: FakePage = {
    hidden: false,
    steps: Array.from({ length: stepCount }, makeStep),
    videos,
    querySelectorAll: (sel) => {
      if (sel === '[data-of-step]') return page.steps;
      if (sel === 'video') return page.videos;
      return [];
    },
  };
  return page;
}

function runViewer(pages: FakePage[]) {
  const html = buildHtml({
    title: 't',
    pagesHtml: pages.map(() => ''),
    bundledCss: '',
    externalLinks: '',
    design: undefined,
  });
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error('viewer script not found');

  const counter = { textContent: '' };
  const handlers: Record<string, (e: unknown) => void> = {};
  const win = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      handlers[type] = fn;
    },
  };
  const doc = {
    querySelectorAll: () => pages,
    getElementById: (id: string) => (id === 'os-cur' ? counter : { style: {} }),
  };
  new Function('window', 'document', script)(win, doc);

  const press = (key: string) => handlers.keydown({ key, preventDefault: () => {} });
  const revealed = (page: FakePage) =>
    page.steps.filter((s) => s.attrs['data-of-step'] === 'revealed').length;
  const current = () => Number(counter.textContent);
  return { press, revealed, current };
}

describe('exported HTML viewer', () => {
  it('pauses and rewinds videos on hidden pages and autoplays visible ones', () => {
    const first = makeVideo(true);
    const second = makeVideo(true);
    const manual = makeVideo(false);
    const pages = [makePage(0, [first]), makePage(0, [second, manual])];
    const { press } = runViewer(pages);

    expect(first.paused).toBe(false);
    expect(second.paused).toBe(true);
    expect(second.currentTime).toBe(0);

    press('ArrowRight');
    expect(first.paused).toBe(true);
    expect(first.currentTime).toBe(0);
    expect(second.paused).toBe(false);
    expect(manual.paused).toBe(true);
  });
});

describe('findHtmlAssetUrls', () => {
  it('collects video poster images alongside src', () => {
    vi.stubGlobal('window', {
      location: { href: 'http://localhost:5173/frames/x', origin: 'http://localhost:5173' },
    });
    const html = '<video src="/assets/clip.mp4" poster="/assets/clip-poster.jpg"></video>';
    expect(findHtmlAssetUrls(html)).toEqual(['/assets/clip.mp4', '/assets/clip-poster.jpg']);
  });
});
