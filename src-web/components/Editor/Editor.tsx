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

export interface EditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  heightMode?: 'auto' | 'full';
  contentType?: string;
  autoFocus?: boolean;
  valueKey?: string | number;
  defaultValue?: string;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  singleLine?: boolean;
}

export default function Editor({
  heightMode,
  contentType,
  autoFocus,
  placeholder,
  valueKey,
  useTemplating,
  defaultValue,
  onChange,
  className,
  singleLine,
  ...props
}: EditorProps) {
  const [cm, setCm] = useState<{ view: EditorView; langHolder: Compartment } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const extensions = useMemo(
    () =>
      getExtensions({
        container: ref.current,
        placeholder,
        singleLine,
        onChange,
        contentType,
        useTemplating,
      }),
    [contentType, ref.current],
  );

  const syncGutterBg = () => {
    if (ref.current === null) return;
    if (singleLine) return;
    const gutterEl = ref.current.querySelector<HTMLDivElement>('.cm-gutters');
    const classList = className?.split(/\s+/) ?? [];
    const bgClasses = classList
      .filter((c) => c.match(/(^|:)?bg-.+/)) // Find bg-* classes
      .map((c) => c.replace(/^bg-/, '!bg-')) // !important
      .map((c) => c.replace(/^dark:bg-/, 'dark:!bg-')); // !important
    if (gutterEl) {
      gutterEl?.classList.add(...bgClasses);
    }
  };

  // Create codemirror instance when ref initializes
  useEffect(() => {
    if (ref.current === null) return;
    console.log('INIT EDITOR');
    let view: EditorView | null = null;
    try {
      const langHolder = new Compartment();
      const langExt = getLanguageExtension({ contentType, useTemplating });
      const state = EditorState.create({
        doc: `${defaultValue ?? ''}`,
        extensions: [...extensions, langHolder.of(langExt)],
      });
      view = new EditorView({
        state,
        parent: ref.current,
      });
      setCm({ view, langHolder });
      syncGutterBg();
      if (autoFocus && view) view.focus();
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
    console.log('UPDATE LANG');
    const ext = getLanguageExtension({ contentType, useTemplating });
    cm.view.dispatch({ effects: cm.langHolder.reconfigure(ext) });
  }, [contentType]);

  return (
    <div
      ref={ref}
      className={classnames(
        className,
        'cm-wrapper text-base bg-background',
        heightMode === 'auto' ? 'cm-auto-height' : 'cm-full-height',
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
  contentType,
  useTemplating,
}: Pick<
  EditorProps,
  'singleLine' | 'onChange' | 'contentType' | 'useTemplating' | 'placeholder'
> & { container: HTMLDivElement | null }) {
  const ext = getLanguageExtension({ contentType, useTemplating });

  // TODO: Ensure tooltips render inside the dialog if we are in one.
  const parent =
    container?.closest<HTMLDivElement>('[role="dialog"]') ??
    document.querySelector<HTMLDivElement>('#cm-portal') ??
    undefined;

  return [
    ...baseExtensions,
    tooltips({ parent }),
    keymap.of(singleLine ? defaultKeymap.filter((k) => k.key !== 'Enter') : defaultKeymap),
    ...(singleLine ? [singleLineExt()] : []),
    ...(!singleLine ? [multiLineExtensions] : []),
    ...(ext ? [ext] : []),
    ...(placeholder ? [placeholderExt(placeholder)] : []),

    ...(singleLine
      ? [
          EditorView.domEventHandlers({
            focus: (e, view) => {
              // select all text on focus, like a regular input does
              view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
            },
            keydown: (e) => {
              // Submit nearest form on enter if there is one
              if (e.key === 'Enter') {
                const el = e.currentTarget as HTMLElement;
                const form = el.closest('form');
                form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            },
          }),
        ]
      : []),

    // Clear selection on blur
    EditorView.domEventHandlers({
      blur: (e, view) => {
        setTimeout(() => {
          view.dispatch({ selection: { anchor: 0, head: 0 } });
        }, 100);
      },
    }),

    // Handle onChange
    EditorView.updateListener.of((update) => {
      if (typeof onChange === 'function' && update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];
}
