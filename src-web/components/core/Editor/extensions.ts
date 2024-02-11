import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import type { LanguageSupport } from '@codemirror/language';
import {
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { graphql, graphqlLanguageSupport } from 'cm6-graphql';
import { EditorView } from 'codemirror';
import { jsonSchema } from 'codemirror-json-schema';
import type { Environment, Workspace } from '../../../lib/models';
import type { EditorProps } from './index';
import { text } from './text/extension';
import { twig } from './twig/extension';
import { url } from './url/extension';

export const myHighlightStyle = HighlightStyle.define([
  {
    tag: [t.documentMeta, t.blockComment, t.lineComment, t.docComment, t.comment],
    color: 'hsl(var(--color-gray-600))',
    fontStyle: 'italic',
  },
  {
    tag: [t.paren],
    color: 'hsl(var(--color-gray-900))',
  },
  {
    tag: [t.name, t.tagName, t.angleBracket, t.docString, t.number],
    color: 'hsl(var(--color-blue-600))',
  },
  { tag: [t.variableName], color: 'hsl(var(--color-green-600))' },
  { tag: [t.bool], color: 'hsl(var(--color-pink-600))' },
  { tag: [t.attributeName, t.propertyName], color: 'hsl(var(--color-violet-600))' },
  { tag: [t.attributeValue], color: 'hsl(var(--color-orange-600))' },
  { tag: [t.string], color: 'hsl(var(--color-yellow-600))' },
  { tag: [t.keyword, t.meta, t.operator], color: 'hsl(var(--color-red-600))' },
]);

const myTheme = EditorView.theme({}, { dark: true });

// export const defaultHighlightStyle = HighlightStyle.define([
//   { tag: t.meta, color: '#404740' },
//   { tag: t.link, textDecoration: 'underline' },
//   { tag: t.heading, textDecoration: 'underline', fontWeight: 'bold' },
//   { tag: t.emphasis, fontStyle: 'italic' },
//   { tag: t.strong, fontWeight: 'bold' },
//   { tag: t.strikethrough, textDecoration: 'line-through' },
//   { tag: t.keyword, color: '#708' },
//   { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: '#219' },
//   { tag: [t.literal, t.inserted], color: '#164' },
//   { tag: [t.string, t.deleted], color: '#a11' },
//   { tag: [t.regexp, t.escape, t.special(t.string)], color: '#e40' },
//   { tag: t.definition(t.variableName), color: '#00f' },
//   { tag: t.local(t.variableName), color: '#30a' },
//   { tag: [t.typeName, t.namespace], color: '#085' },
//   { tag: t.className, color: '#167' },
//   { tag: [t.special(t.variableName), t.macroName], color: '#256' },
//   { tag: t.definition(t.propertyName), color: '#00c' },
//   { tag: t.comment, color: '#940' },
//   { tag: t.invalid, color: '#f00' },
// ]);

const syntaxExtensions: Record<string, LanguageSupport> = {
  'application/grpc': jsonSchema() as unknown as LanguageSupport, // TODO: Fix this
  'application/graphql': graphqlLanguageSupport(),
  'application/json': json(),
  'application/javascript': javascript(),
  'text/html': xml(), // HTML as xml because HTML is oddly slow
  'application/xml': xml(),
  'text/xml': xml(),
  url: url(),
};

export function getLanguageExtension({
  contentType,
  useTemplating = false,
  environment,
  workspace,
  autocomplete,
}: { environment: Environment | null; workspace: Workspace | null } & Pick<
  EditorProps,
  'contentType' | 'useTemplating' | 'autocomplete'
>) {
  const justContentType = contentType?.split(';')[0] ?? contentType ?? '';
  if (justContentType === 'application/graphql') {
    return graphql();
  }
  const base = syntaxExtensions[justContentType] ?? text();
  if (!useTemplating) {
    return base;
  }

  return twig(base, environment, workspace, autocomplete);
}

export const baseExtensions = [
  highlightSpecialChars(),
  history(),
  dropCursor(),
  drawSelection(),
  // TODO: Figure out how to debounce showing of autocomplete in a good way
  // debouncedAutocompletionDisplay({ millis: 1000 }),
  // autocompletion({ closeOnBlur: true, interactionDelay: 200, activateOnTyping: false }),
  autocompletion({
    // closeOnBlur: false,
    compareCompletions: (a, b) => {
      // Don't sort completions at all, only on boost
      return (a.boost ?? 0) - (b.boost ?? 0);
    },
  }),
  keymap.of([indentWithTab]),
  syntaxHighlighting(myHighlightStyle),
  myTheme,
  EditorState.allowMultipleSelections.of(true),
];

export const multiLineExtensions = [
  lineNumbers(),
  foldGutter({
    markerDOM: (open) => {
      const el = document.createElement('div');
      el.classList.add('fold-gutter-icon');
      el.tabIndex = -1;
      if (open) {
        el.setAttribute('data-open', '');
      }
      return el;
    },
  }),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLineGutter(),
  highlightSelectionMatches({ minSelectionLength: 2 }),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];
