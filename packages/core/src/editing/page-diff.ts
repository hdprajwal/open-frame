import { parse as babelParse } from '@babel/parser';

type Node = Record<string, unknown>;

export type PageSource = { name: string; body: string };

function parseModule(source: string): Node[] | null {
  try {
    const ast = babelParse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
    return (ast as unknown as { program?: { body?: Node[] } }).program?.body ?? [];
  } catch {
    return null;
  }
}

function unwrap(node: Node | undefined): Node | undefined {
  let inner = node;
  while (inner && (inner.type === 'TSAsExpression' || inner.type === 'TSSatisfiesExpression')) {
    inner = inner.expression as Node | undefined;
  }
  return inner;
}

function defaultExportPageNames(body: Node[]): string[] | null {
  for (const node of body) {
    if (node.type !== 'ExportDefaultDeclaration') continue;
    const inner = unwrap(node.declaration as Node | undefined);
    if (!inner || inner.type !== 'ArrayExpression') return null;
    const elements = (inner.elements as Array<Node | null>) ?? [];
    const names: string[] = [];
    for (const el of elements) {
      // An inline page (`export default [() => <div/>]`) has no declaration to
      // compare against, so the whole file falls back to "unknown".
      if (!el || el.type !== 'Identifier' || typeof el.name !== 'string') return null;
      names.push(el.name);
    }
    return names;
  }
  return null;
}

function declarationRanges(body: Node[]): Map<string, [number, number]> {
  const ranges = new Map<string, [number, number]>();
  const record = (name: unknown, start: unknown, end: unknown) => {
    if (typeof name !== 'string') return;
    if (typeof start !== 'number' || typeof end !== 'number') return;
    ranges.set(name, [start, end]);
  };

  for (const raw of body) {
    const node = raw.type === 'ExportNamedDeclaration' ? ((raw.declaration as Node) ?? raw) : raw;
    if (node.type === 'FunctionDeclaration') {
      const id = node.id as Node | undefined;
      record(id?.name, node.start, node.end);
      continue;
    }
    if (node.type === 'VariableDeclaration') {
      for (const decl of (node.declarations as Node[]) ?? []) {
        const id = decl.id as Node | undefined;
        record(id?.name, decl.start, decl.end);
      }
    }
  }
  return ranges;
}

/**
 * The ordered page components of a frame entry, each paired with the exact
 * source text of its declaration. Returns null when the file's shape isn't one
 * this can reason about — an unparseable module, a non-array default export, or
 * a page that isn't a plain identifier pointing at a top-level declaration.
 */
export function readPageSources(source: string): PageSource[] | null {
  const body = parseModule(source);
  if (!body) return null;
  const names = defaultExportPageNames(body);
  if (!names) return null;

  const ranges = declarationRanges(body);
  const pages: PageSource[] = [];
  for (const name of names) {
    const range = ranges.get(name);
    if (!range) return null;
    pages.push({ name, body: source.slice(range[0], range[1]) });
  }
  return pages;
}

/**
 * Indices into the *new* page list whose component changed or was added.
 *
 * Matching is positional first and by name second, so inserting a page reports
 * only the insertion rather than every page after it. Returns null when either
 * side can't be read, which callers treat as "something changed, but we can't
 * say which page".
 */
export function changedPageIndices(prevSource: string, nextSource: string): number[] | null {
  const prev = readPageSources(prevSource);
  const next = readPageSources(nextSource);
  if (!prev || !next) return null;

  const prevByName = new Map<string, string>();
  for (const page of prev) prevByName.set(page.name, page.body);

  const changed: number[] = [];
  next.forEach((page, index) => {
    const positional = prev[index];
    if (positional && positional.name === page.name) {
      if (positional.body !== page.body) changed.push(index);
      return;
    }
    const byName = prevByName.get(page.name);
    if (byName === undefined || byName !== page.body) changed.push(index);
  });
  return changed;
}
