import type { CompletionContext } from '@codemirror/autocomplete';

const openTag = '${[ ';
const closeTag = ' ]}';

const variables = [
  { name: 'DOMAIN' },
  { name: 'BASE_URL' },
  { name: 'TOKEN' },
  { name: 'PROJECT_ID' },
  { name: 'DUMMY' },
  { name: 'DUMMY_2' },
];

export function myCompletions(context: CompletionContext) {
  const toStartOfName = context.explicit ? context.matchBefore(/\w*/) : context.matchBefore(/\w+/);
  const toStartOfVariable = context.matchBefore(/\$\{?\[?\s*\w*/);
  const toMatch = toStartOfVariable ?? toStartOfName ?? null;

  if (toMatch === null) {
    return null;
  }

  // Match a minimum of two characters when typing a variable ${[...]} to prevent it
  // from opening on "$"
  if (toStartOfVariable !== null && toMatch.to - toMatch.from < 2 && !context.explicit) {
    return null;
  }

  return {
    from: toMatch.from,
    options: variables.map((v) => ({
      label: toStartOfVariable ? `${openTag}${v.name}${closeTag}` : v.name,
      apply: `${openTag}${v.name}${closeTag}`,
      type: 'variable',
    })),
  };
}
