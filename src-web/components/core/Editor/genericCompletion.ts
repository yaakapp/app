import type { CompletionContext } from '@codemirror/autocomplete';

export interface GenericCompletionOption {
  label: string;
  type: 'constant' | 'variable';
  detail?: string;
  info?: string;
  /** When given, should be a number from -99 to 99 that adjusts
   * how this completion is ranked compared to other completions
   * that match the input as well as this one. A negative number
   * moves it down the list, a positive number moves it up. */
  boost?: number;
}

export interface GenericCompletionConfig {
  minMatch?: number;
  options: GenericCompletionOption[];
}

/**
 * Complete options, always matching until the start of the line
 */
export function genericCompletion(config?: GenericCompletionConfig) {
  if (config == null) return [];

  const { minMatch = 1, options } = config;

  return function completions(context: CompletionContext) {
    const toMatch = context.matchBefore(/.*/);

    // Only match if we're at the start of the line
    if (toMatch === null || toMatch.from > 0) return null;

    const matchedMinimumLength = toMatch.to - toMatch.from >= minMatch;
    if (!matchedMinimumLength && !context.explicit) return null;

    const optionsWithoutExactMatches = options.filter((o) => o.label !== toMatch.text);
    return {
      validFor: () => true, // Not really sure why this is all it needs
      from: toMatch.from,
      options: optionsWithoutExactMatches,
    };
  };
}
