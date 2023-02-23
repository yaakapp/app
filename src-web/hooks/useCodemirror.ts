import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { EditorState } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { HighlightStyle, LanguageSupport, syntaxHighlighting } from '@codemirror/language';

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

const extensions = [basicSetup, syntaxHighlighting(myHighlightStyle)];

export default function useCodeMirror({
  value,
  contentType,
}: {
  value: string;
  contentType: string;
}) {
  const [cm, setCm] = useState<EditorView | null>(null);
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current === null) return;

    const view = new EditorView({
      extensions: getExtensions(contentType),
      parent: ref.current,
    });

    setCm(view);

    return () => view?.destroy();
  }, [ref.current]);

  useEffect(() => {
    if (cm === null) return;

    const newState = EditorState.create({
      doc: value,
      extensions: getExtensions(contentType),
    });
    cm.setState(newState);
  }, [cm, value]);

  return { ref, cm };
}

function getExtensions(contentType: string) {
  const ext = syntaxExtensions[contentType];
  return ext ? [...extensions, ext] : extensions;
}
