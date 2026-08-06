import { describe, expect, it } from 'vitest';
import { changedPageIndices, readPageSources } from './page-diff';

const frame = (pages: string[], names: string[]) =>
  `${pages.join('\n\n')}\n\nexport default [${names.join(', ')}] satisfies Page[];\n`;

const cover = `function Cover() {\n  return <div>Cover</div>;\n}`;
const idea = `function Idea() {\n  return <div>Idea</div>;\n}`;
const close = `function Close() {\n  return <div>Close</div>;\n}`;

const base = frame([cover, idea, close], ['Cover', 'Idea', 'Close']);

describe('readPageSources', () => {
  it('reads pages in default-export order, not declaration order', () => {
    const source = frame([close, cover, idea], ['Cover', 'Idea', 'Close']);
    expect(readPageSources(source)?.map((p) => p.name)).toEqual(['Cover', 'Idea', 'Close']);
  });

  it('reads arrow-function pages declared as consts', () => {
    const source = frame(
      ['const Cover: Page = () => <div>Cover</div>;', 'const Idea: Page = () => <div>Idea</div>;'],
      ['Cover', 'Idea'],
    );
    expect(readPageSources(source)?.map((p) => p.name)).toEqual(['Cover', 'Idea']);
  });

  it('gives up on an inline page it cannot match to a declaration', () => {
    expect(readPageSources('export default [() => <div/>] satisfies Page[];')).toBeNull();
  });

  it('gives up when a page identifier has no top-level declaration', () => {
    expect(readPageSources('export default [Missing] satisfies Page[];')).toBeNull();
  });
});

describe('changedPageIndices', () => {
  it('reports nothing when the pages are untouched', () => {
    expect(changedPageIndices(base, base)).toEqual([]);
  });

  it('reports the edited page only', () => {
    const next = base.replace('<div>Idea</div>', '<div>Idea, revised</div>');
    expect(changedPageIndices(base, next)).toEqual([1]);
  });

  it('reports only the insertion, not everything after it', () => {
    const pace = `function Pace() {\n  return <div>Pace</div>;\n}`;
    const next = frame([cover, idea, pace, close], ['Cover', 'Idea', 'Pace', 'Close']);
    expect(changedPageIndices(base, next)).toEqual([2]);
  });

  it('reports nothing for a pure reorder — the pages themselves are unchanged', () => {
    const next = frame([cover, idea, close], ['Close', 'Cover', 'Idea']);
    expect(changedPageIndices(base, next)).toEqual([]);
  });

  it('reports every page an edit touched', () => {
    const next = base
      .replace('<div>Cover</div>', '<div>Cover!</div>')
      .replace('<div>Close</div>', '<div>Close!</div>');
    expect(changedPageIndices(base, next)).toEqual([0, 2]);
  });

  // These use bodies that don't echo their own component name — see the
  // over-blanking note on PageSource.shape.
  const named = (name: string, body: string) =>
    `function ${name}() {\n  return <div>${body}</div>;\n}`;

  it('reports nothing when a page is renamed and moved but its content is untouched', () => {
    const before = frame([named('Cover', 'a'), named('Idea', 'b')], ['Cover', 'Idea']);
    const after = frame([named('Cover', 'a'), named('Thought', 'b')], ['Thought', 'Cover']);
    expect(changedPageIndices(before, after)).toEqual([]);
  });

  it('still reports a duplicated page, whose content appears one more time than before', () => {
    const before = frame([named('Cover', 'a'), named('Idea', 'b')], ['Cover', 'Idea']);
    const after = frame(
      [named('Cover', 'a'), named('CoverCopy', 'a'), named('Idea', 'b')],
      ['Cover', 'CoverCopy', 'Idea'],
    );
    expect(changedPageIndices(before, after)).toEqual([1]);
  });

  it('falls back to reporting a change when a rename over-blanks the page text', () => {
    const next = frame(
      [cover, close, idea.replace('function Idea()', 'function Thought()')],
      ['Cover', 'Close', 'Thought'],
    );
    expect(changedPageIndices(base, next)).toEqual([2]);
  });

  it('returns null when either side is unreadable', () => {
    expect(changedPageIndices(base, 'export default [() => <div/>];')).toBeNull();
  });

  it('ignores a change outside any page component', () => {
    const next = base.replace('export default', 'const unrelated = 1;\nexport default');
    expect(changedPageIndices(base, next)).toEqual([]);
  });
});
