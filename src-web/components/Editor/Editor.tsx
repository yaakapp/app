import './Editor.css';
import { useEffect, useMemo, useRef } from 'react';
import { EditorView } from 'codemirror';
import { baseExtensions, syntaxExtension } from './extensions';
import { EditorState } from '@codemirror/state';

interface Props {
  contentType: string;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
}

export default function Editor({ contentType, defaultValue, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const extensions = useMemo(() => {
    const ext = syntaxExtension(contentType);
    return [
      ...baseExtensions,
      ...(ext ? [ext] : []),
      EditorView.updateListener.of((update) => {
        if (typeof onChange === 'function') {
          onChange(update.state.doc.toString());
        }
      }),
    ];
  }, [contentType]);

  useEffect(() => {
    if (ref.current === null) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: defaultValue ?? '',
        extensions: extensions,
      }),
      parent: ref.current,
    });
    return () => view?.destroy();
  }, [ref.current]);

  return <div ref={ref} className="cm-wrapper" />;
}
