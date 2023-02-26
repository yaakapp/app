import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  LanguageSupport,
  syntaxHighlighting,
} from '@codemirror/language';
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
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { tags } from '@lezer/highlight';

export const myHighlightStyle = HighlightStyle.define([
  {
    tag: [tags.documentMeta, tags.blockComment, tags.lineComment, tags.docComment, tags.comment],
    color: '#757b93',
  },
  { tag: tags.name, color: '#4699de' },
  { tag: tags.variableName, color: '#31c434' },
  { tag: tags.bool, color: '#e864f6' },
  { tag: tags.attributeName, color: '#8f68ff' },
  { tag: tags.attributeValue, color: '#ff964b' },
  { tag: [tags.keyword, tags.string], color: '#e8b045' },
  { tag: tags.comment, color: '#cec4cc', fontStyle: 'italic' },
]);

const syntaxExtensions: Record<string, LanguageSupport> = {
  'application/json': json(),
  'application/javascript': javascript(),
  'text/html': html(),
};

export function syntaxExtension(contentType: string): LanguageSupport | undefined {
  return syntaxExtensions[contentType];
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
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
