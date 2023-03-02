import type { CompletionContext } from '@codemirror/autocomplete';
import { match } from 'assert';

const openTag = '${[ ';
const closeTag = ' ]}';

const variables = [
  { name: 'DOMAIN' },
  { name: 'BASE_URL' },
  { name: 'TOKEN' },
  { name: 'PROJECT_ID' },
  { name: 'DUMMY' },
  { name: 'DUMMY_2' },
  { name: 'STRIPE_PUB_KEY' },
  { name: 'RAILWAY_TOKEN' },
  { name: 'SECRET' },
  { name: 'PORT' },
];

const MIN_MATCH_VAR = 2;
const MIN_MATCH_NAME = 2;

export function completions(context: CompletionContext) {
  const toStartOfName = context.matchBefore(/\w*/);
  const toStartOfVariable = context.matchBefore(/\$\{?\[?\s*\w*/);
  const toMatch = toStartOfVariable ?? toStartOfName ?? null;

  if (toMatch === null) return null;

  const matchLen = toMatch.to - toMatch.from;

  const failedVarLen = toStartOfVariable !== null && matchLen < MIN_MATCH_VAR;
  if (failedVarLen && !context.explicit) {
    return null;
  }

  const failedNameLen = toStartOfVariable === null && matchLen < MIN_MATCH_NAME;
  if (failedNameLen && !context.explicit) {
    return null;
  }

  // TODO: Figure out how to make autocomplete stay open if opened explicitly. It sucks when you explicitly
  //  open it, then it closes when you type the next character.
  return {
    from: toMatch.from,
    options: variables
      .map((v) => ({
        label: toStartOfVariable ? `${openTag}${v.name}${closeTag}` : v.name,
        apply: `${openTag}${v.name}${closeTag}`,
        type: 'variable',
      }))
      // Filter out exact matches
      .filter((o) => o.label !== toMatch.text),
  };
}
