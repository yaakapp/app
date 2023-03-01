import type { CompletionContext } from '@codemirror/autocomplete';

const openTag = '${[ ';
const closeTag = ' ]}';

const variables = [
  { name: 'DOMAIN' },
  { name: 'BASE_URL' },
  { name: 'TOKEN' },
  { name: 'PROJECT_ID' },
];

export function myCompletions(context: CompletionContext) {
  const toStartOfName = context.matchBefore(/\w*/);
  const toStartOfVariable = context.matchBefore(/\$\{.*/);
  const toMatch = toStartOfVariable ?? toStartOfName ?? null;

  if (toMatch === null) {
    return null;
  }

  if (toMatch.from === toMatch.to && !context.explicit) {
    return null;
  }

  return {
    from: toMatch.from,
    options: variables.map((v) => ({
      label: `${openTag}${v.name}${closeTag}`,
      type: 'variable',
    })),
  };
}
