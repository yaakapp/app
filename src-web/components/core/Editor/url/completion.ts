import type { CompletionContext } from '@codemirror/autocomplete';

const options = [
  { label: 'http://', type: 'constant' },
  { label: 'https://', type: 'constant' },
];

const MIN_MATCH = 1;

export function completions(context: CompletionContext) {
  const toMatch = context.matchBefore(/^[\w:/]*/);
  if (toMatch === null) return null;

  const matchedMinimumLength = toMatch.to - toMatch.from >= MIN_MATCH;
  if (!matchedMinimumLength && !context.explicit) return null;

  const optionsWithoutExactMatches = options.filter((o) => o.label !== toMatch.text);
  return { from: toMatch.from, options: optionsWithoutExactMatches };
}
