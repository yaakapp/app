import type { CompletionContext } from '@codemirror/autocomplete';

export interface GenericCompletionOption {
  label: string;
  type: 'constant' | 'variable';
}

export function genericCompletion({
  options,
  minMatch = 1,
}: {
  options: GenericCompletionOption[];
  minMatch?: number;
}) {
  return function completions(context: CompletionContext) {
    const toMatch = context.matchBefore(/^[\w:/]*/);
    if (toMatch === null) return null;

    const matchedMinimumLength = toMatch.to - toMatch.from >= minMatch;
    if (!matchedMinimumLength && !context.explicit) return null;

    const optionsWithoutExactMatches = options.filter((o) => o.label !== toMatch.text);
    return { from: toMatch.from, options: optionsWithoutExactMatches };
  };
}
