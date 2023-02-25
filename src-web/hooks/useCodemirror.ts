import { useEffect, useRef, useState } from 'react';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { tags } from '@lezer/highlight';
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

const myHighlightStyle = HighlightStyle.define([
  {
    tag: [tags.documentMeta, tags.blockComment, tags.lineComment, tags.docComment, tags.comment],
    color: '#757b93',
  },
  { tag: tags.name, color: '#4699de' },
  { tag: tags.variableName, color: '#31c434' },
  { tag: tags.attributeName, color: '#b06fff' },
  { tag: tags.attributeValue, color: '#ff964b' },
  { tag: [tags.keyword, tags.string], color: '#e8b045' },
  { tag: tags.comment, color: '#f5d', fontStyle: 'italic' },
]);

const syntaxExtensions: Record<string, LanguageSupport> = {
  'application/json': json(),
  'application/javascript': javascript(),
  'text/html': html(),
};

const extensions = [
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

export default function useCodeMirror({
  initialValue,
  value,
  contentType,
  onChange,
}: {
  initialValue?: string;
  value?: string;
  contentType: string;
  onChange?: (value: string) => void;
}) {
  const [cm, setCm] = useState<EditorView | null>(null);
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current === null) return;
    const state = EditorState.create({
      doc: initialValue,
      extensions: getExtensions({ contentType, onChange }),
    });
    const view = new EditorView({
      state,
      parent: ref.current,
    });

    setCm(view);

    return () => view?.destroy();
  }, [ref.current]);

  useEffect(() => {
    if (cm === null) return;

    const newState = EditorState.create({
      doc: value ?? cm.state.doc,
      extensions: getExtensions({ contentType, onChange }),
    });
    cm.setState(newState);
  }, [cm, contentType, value, onChange]);

  return { ref, cm };
}

function getExtensions({
  contentType,
  onChange,
}: {
  contentType: string;
  onChange?: (value: string) => void;
}) {
  const ext = syntaxExtensions[contentType];
  return ext
    ? [
        ...extensions,
        ...(onChange
          ? [EditorView.updateListener.of((update) => onChange(update.state.doc.toString()))]
          : []),
        ext,
      ]
    : extensions;
}
