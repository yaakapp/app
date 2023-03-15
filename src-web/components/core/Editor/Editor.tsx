import { defaultKeymap } from '@codemirror/commands';
import { Compartment, EditorState } from '@codemirror/state';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import classnames from 'classnames';
import { EditorView } from 'codemirror';
import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';
import { useUnmount } from 'react-use';
import './Editor.css';
import { baseExtensions, getLanguageExtension, multiLineExtensions } from './extensions';
import { singleLineExt } from './singleLine';

export interface _EditorProps {
  id?: string;
  readOnly?: boolean;
  className?: string;
  heightMode?: 'auto' | 'full';
  contentType?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  singleLine?: boolean;
}

export function _Editor({
  readOnly,
  heightMode,
  contentType,
  autoFocus,
  placeholder,
  useTemplating,
  defaultValue,
  onChange,
  onFocus,
  className,
  singleLine,
}: _EditorProps) {
  const cm = useRef<{ view: EditorView; langHolder: Compartment } | null>(null);

  // Unmount the editor
  useUnmount(() => {
    cm.current?.view.destroy();
    cm.current = null;
  });

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleChange = useRef<_EditorProps['onChange']>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleFocus = useRef<_EditorProps['onFocus']>(onFocus);
  useEffect(() => {
    handleFocus.current = onFocus;
  }, [onFocus]);

  // Update language extension when contentType changes
  useEffect(() => {
    if (cm.current === null) return;
    const { view, langHolder } = cm.current;
    const ext = getLanguageExtension({ contentType, useTemplating });
    view.dispatch({ effects: langHolder.reconfigure(ext) });
  }, [contentType]);

  // Initialize the editor
  const initDivRef = (el: HTMLDivElement | null) => {
    if (el === null || cm.current !== null) return;

    try {
      const langHolder = new Compartment();
      const langExt = getLanguageExtension({ contentType, useTemplating });
      const state = EditorState.create({
        doc: `${defaultValue ?? ''}`,
        extensions: [
          langHolder.of(langExt),
          ...getExtensions({
            container: el,
            onChange: handleChange,
            onFocus: handleFocus,
            readOnly,
            placeholder,
            singleLine,
            contentType,
            useTemplating,
          }),
        ],
      });
      const view = new EditorView({ state, parent: el });
      cm.current = { view, langHolder };
      syncGutterBg({ parent: el, className });
      if (autoFocus) view.focus();
    } catch (e) {
      console.log('Failed to initialize Codemirror', e);
    }
  };

  return (
    <div
      ref={initDivRef}
      dangerouslySetInnerHTML={{ __html: '' }}
      className={classnames(
        className,
        'cm-wrapper text-base bg-gray-50',
        heightMode === 'auto' ? 'cm-auto-height' : 'cm-full-height',
        singleLine ? 'cm-singleline' : 'cm-multiline',
        readOnly && 'cm-readonly',
      )}
    />
  );
}

function getExtensions({
  container,
  readOnly,
  singleLine,
  placeholder,
  onChange,
  onFocus,
  contentType,
  useTemplating,
}: Pick<
  _EditorProps,
  'singleLine' | 'contentType' | 'useTemplating' | 'placeholder' | 'readOnly'
> & {
  container: HTMLDivElement | null;
  onChange: MutableRefObject<_EditorProps['onChange']>;
  onFocus: MutableRefObject<_EditorProps['onFocus']>;
}) {
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
    ...(readOnly ? [EditorState.readOnly.of(true)] : []),
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

    // Handle onFocus
    EditorView.domEventHandlers({
      focus: () => {
        onFocus.current?.();
      },
    }),

    // Handle onChange
    EditorView.updateListener.of((update) => {
      if (onChange && update.docChanged) {
        onChange.current?.(update.state.doc.toString());
      }
    }),
  ];
}

const syncGutterBg = ({
  parent,
  className = '',
}: {
  parent: HTMLDivElement;
  className?: string;
}) => {
  const gutterEl = parent.querySelector<HTMLDivElement>('.cm-gutters');
  const classList = className?.split(/\s+/) ?? [];
  const bgClasses = classList
    .filter((c) => c.match(/(^|:)?bg-.+/)) // Find bg-* classes
    .map((c) => c.replace(/^bg-/, '!bg-')) // !important
    .map((c) => c.replace(/^dark:bg-/, 'dark:!bg-')); // !important
  if (gutterEl) {
    gutterEl?.classList.add(...bgClasses);
  }
};
