import { defaultKeymap } from '@codemirror/commands';
import { Compartment, EditorState } from '@codemirror/state';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import classnames from 'classnames';
import { EditorView } from 'codemirror';
import type { HTMLAttributes } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './Editor.css';
import { baseExtensions, getLanguageExtension, multiLineExtensions } from './extensions';
import { singleLineExt } from './singleLine';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  contentType: string;
  valueKey?: string;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  singleLine?: boolean;
}

export default function Editor({
  contentType,
  placeholder,
  valueKey,
  useTemplating,
  defaultValue,
  onChange,
  onSubmit,
  className,
  singleLine,
  ...props
}: Props) {
  const [cm, setCm] = useState<{ view: EditorView; langHolder: Compartment } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const extensions = useMemo(
    () =>
      getExtensions({
        container: ref.current,
        placeholder,
        onSubmit,
        singleLine,
        onChange,
        contentType,
        useTemplating,
      }),
    [contentType, ref.current],
  );

  const newState = (langHolder: Compartment) => {
    const langExt = getLanguageExtension({ contentType, useTemplating });
    return EditorState.create({
      doc: `${defaultValue ?? ''}`,
      extensions: [...extensions, langHolder.of(langExt)],
    });
  };

  // Create codemirror instance when ref initializes
  useEffect(() => {
    if (ref.current === null) return;
    let view: EditorView | null = null;
    try {
      const langHolder = new Compartment();
      view = new EditorView({
        state: newState(langHolder),
        parent: ref.current,
      });
      setCm({ view, langHolder });
    } catch (e) {
      console.log('Failed to initialize Codemirror', e);
    }
    return () => view?.destroy();
  }, [ref.current, valueKey]);

  // Update value when valueKey changes
  // TODO: This would be more efficient but the onChange handler gets fired on update
  // useEffect(() => {
  //   if (cm === null) return;
  //   console.log('NEW DOC', valueKey, defaultValue);
  //   cm.view.dispatch({
  //     changes: { from: 0, to: cm.view.state.doc.length, insert: `${defaultValue ?? ''}` },
  //   });
  // }, [valueKey]);

  // Update language extension when contentType changes
  useEffect(() => {
    if (cm === null) return;
    const ext = getLanguageExtension({ contentType, useTemplating });
    cm.view.dispatch({ effects: cm.langHolder.reconfigure(ext) });
  }, [contentType]);

  return (
    <div
      ref={ref}
      className={classnames(
        className,
        'cm-wrapper text-base',
        singleLine ? 'cm-singleline' : 'cm-multiline',
      )}
      {...props}
    />
  );
}

function getExtensions({
  container,
  singleLine,
  placeholder,
  onChange,
  onSubmit,
  contentType,
  useTemplating,
}: Pick<
  Props,
  'singleLine' | 'onChange' | 'onSubmit' | 'contentType' | 'useTemplating' | 'placeholder'
> & { container: HTMLDivElement | null }) {
  const ext = getLanguageExtension({ contentType, useTemplating });

  // TODO: This is a hack to get the tooltips to render in the correct place when inside a modal dialog
  const parent = container?.closest<HTMLDivElement>('.dialog-content') ?? undefined;

  return [
    ...baseExtensions,
    tooltips({ parent }),
    keymap.of(singleLine ? defaultKeymap.filter((k) => k.key !== 'Enter') : defaultKeymap),
    ...(singleLine ? [singleLineExt()] : []),
    ...(!singleLine ? [multiLineExtensions] : []),
    ...(ext ? [ext] : []),
    ...(placeholder ? [placeholderExt(placeholder)] : []),

    // Handle onSubmit
    ...(onSubmit
      ? [
          EditorView.domEventHandlers({
            keydown: (e) => {
              if (e.key === 'Enter') onSubmit?.();
            },
          }),
        ]
      : []),
    // Handle onChange
    EditorView.updateListener.of((update) => {
      if (typeof onChange === 'function' && update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];
}
