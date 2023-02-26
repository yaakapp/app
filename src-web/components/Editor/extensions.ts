import { parser as twigParser } from './twig/twig';
import {
  bracketMatching,
  foldGutter,
  foldInside,
  foldKeymap,
  foldNodeProp,
  HighlightStyle,
  indentNodeProp,
  indentOnInput,
  LanguageSupport,
  LRLanguage,
  syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { parseMixed } from '@lezer/common';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { tags as t } from '@lezer/highlight';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { placeholders } from './widgets';

export const myHighlightStyle = HighlightStyle.define([
  {
    tag: [t.documentMeta, t.blockComment, t.lineComment, t.docComment, t.comment],
    color: '#757b93',
  },
  { tag: [t.name], color: '#4699de' },
  { tag: [t.variableName], color: '#31c434' },
  { tag: [t.bool], color: '#e864f6' },
  { tag: [t.attributeName], color: '#8f68ff' },
  { tag: [t.attributeValue], color: '#ff964b' },
  { tag: [t.string], color: '#e8b045' },
  { tag: [t.keyword, t.meta], color: '#45e8a4' },
  { tag: [t.comment], color: '#cec4cc', fontStyle: 'italic' },
]);

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

const syntaxExtensions: Record<string, { base: LanguageSupport; ext: any[] }> = {
  'application/json': { base: json(), ext: [] },
  'application/javascript': { base: javascript(), ext: [] },
  'text/html': { base: html(), ext: [] },
};

export function syntaxExtension({
  contentType,
  useTemplating,
}: {
  contentType: string;
  useTemplating?: boolean;
}) {
  const { base, ext } = syntaxExtensions[contentType] ?? { base: json(), ext: [] };
  if (!useTemplating) {
    return [base];
  }

  const mixedTwigParser = twigParser.configure({
    props: [
      // Add basic folding/indent metadata
      foldNodeProp.add({ Conditional: foldInside }),
      indentNodeProp.add({
        Conditional: (cx) => {
          const closed = /^\s*\{% endif/.test(cx.textAfter);
          return cx.lineIndent(cx.node.from) + (closed ? 0 : cx.unit);
        },
      }),
    ],
    wrap: parseMixed((node) => {
      return node.type.isTop
        ? {
            parser: base.language.parser,
            overlay: (node) => node.type.name == 'Text',
          }
        : null;
    }),
  });

  const twigLanguage = LRLanguage.define({ parser: mixedTwigParser });
  return [twigLanguage, placeholders, base.support, ...ext];
}

export const baseExtensions = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
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
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
  syntaxHighlighting(myHighlightStyle),
];
