import { defaultKeymap } from '@codemirror/commands';
import type { Extension } from '@codemirror/state';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import classnames from 'classnames';
import { EditorView } from 'codemirror';
import type { MutableRefObject } from 'react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { IconButton } from '../IconButton';
import './Editor.css';
import { baseExtensions, getLanguageExtension, multiLineExtensions } from './extensions';
import type { GenericCompletionConfig } from './genericCompletion';
import { singleLineExt } from './singleLine';

// Export some things so all the code-split parts are in this file
export { buildClientSchema, getIntrospectionQuery } from 'graphql/utilities';
export { graphql } from 'cm6-graphql';
export { formatSdl } from 'format-graphql';

export interface EditorProps {
  id?: string;
  readOnly?: boolean;
  type?: 'text' | 'password';
  className?: string;
  heightMode?: 'auto' | 'full';
  contentType?: string;
  languageExtension?: Extension;
  forceUpdateKey?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  singleLine?: boolean;
  format?: (v: string) => string;
  autocomplete?: GenericCompletionConfig;
}

export function Editor({ defaultValue, forceUpdateKey, ...props }: EditorProps) {
  // In order to not have the editor render too much, we combine forceUpdateKey
  // here with default value so that we only send new props to the editor when
  // forceUpdateKey changes. The editor can then use the defaultValue to force
  // update instead of using both forceUpdateKey and defaultValue.
  //
  // NOTE: This was originally done to fix a bug where the editor would unmount
  //   and remount after the first change event, something to do with React
  //   StrictMode. This fixes it, though, and actually makes more sense
  const fixedDefaultValue = useMemo(() => defaultValue, [forceUpdateKey, props.type]);
  return <_Editor defaultValue={fixedDefaultValue} {...props} />;
}

const _Editor = memo(function _Editor({
  readOnly,
  type = 'text',
  heightMode,
  contentType,
  autoFocus,
  placeholder,
  useTemplating,
  defaultValue,
  languageExtension,
  onChange,
  onFocus,
  className,
  singleLine,
  format,
  autocomplete,
}: Omit<EditorProps, 'forceUpdateKey'>) {
  const cm = useRef<{ view: EditorView; languageCompartment: Compartment } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleChange = useRef<EditorProps['onChange']>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleFocus = useRef<EditorProps['onFocus']>(onFocus);
  useEffect(() => {
    handleFocus.current = onFocus;
  }, [onFocus]);

  // Update placeholder
  const placeholderCompartment = useRef(new Compartment());
  useEffect(() => {
    if (cm.current === null) return;
    const effect = placeholderCompartment.current.reconfigure(
      placeholderExt(placeholderElFromText(placeholder ?? '')),
    );
    cm.current?.view.dispatch({ effects: effect });
  }, [placeholder]);

  // Update language extension when contentType changes
  useEffect(() => {
    if (cm.current === null) return;
    const { view, languageCompartment } = cm.current;
    const ext = getLanguageExtension({ contentType, useTemplating, autocomplete });
    view.dispatch({ effects: languageCompartment.reconfigure(ext) });
  }, [contentType, autocomplete]);

  useEffect(() => {
    if (cm.current === null) return;
    const { view } = cm.current;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: defaultValue ?? '' } });
  }, [defaultValue]);

  // Initialize the editor when ref mounts
  useEffect(() => {
    if (wrapperRef.current === null || cm.current !== null) return;
    let view: EditorView;
    try {
      const languageCompartment = new Compartment();
      const langExt =
        languageExtension ?? getLanguageExtension({ contentType, useTemplating, autocomplete });
      const state = EditorState.create({
        doc: `${defaultValue ?? ''}`,
        extensions: [
          languageCompartment.of(langExt),
          placeholderCompartment.current.of(
            placeholderExt(placeholderElFromText(placeholder ?? '')),
          ),
          ...getExtensions({
            container: wrapperRef.current,
            onChange: handleChange,
            onFocus: handleFocus,
            readOnly,
            singleLine,
          }),
        ],
      });
      view = new EditorView({ state, parent: wrapperRef.current });
      cm.current = { view, languageCompartment };
      syncGutterBg({ parent: wrapperRef.current, className });
      if (autoFocus) view.focus();
    } catch (e) {
      console.log('Failed to initialize Codemirror', e);
    }
    return () => {
      view.destroy();
      cm.current = null;
    };
  }, [wrapperRef.current, languageExtension]);

  const cmContainer = (
    <div
      ref={wrapperRef}
      className={classnames(
        className,
        'cm-wrapper text-base bg-gray-50',
        type === 'password' && 'cm-obscure-text',
        heightMode === 'auto' ? 'cm-auto-height' : 'cm-full-height',
        singleLine ? 'cm-singleline' : 'cm-multiline',
        readOnly && 'cm-readonly',
      )}
    />
  );

  if (singleLine) {
    return cmContainer;
  }

  return (
    <div className="group relative h-full w-full">
      {cmContainer}
      {format && (
        <IconButton
          showConfirm
          size="sm"
          title="Reformat contents"
          icon="magicWand"
          className="absolute bottom-2 right-0 transition-opacity opacity-0 group-hover:opacity-70"
          onClick={() => {
            if (cm.current === null) return;
            const { doc } = cm.current.view.state;
            const insert = format(doc.toString());
            // Update editor and blur because the cursor will reset anyway
            cm.current.view.dispatch({ changes: { from: 0, to: doc.length, insert } });
            cm.current.view.contentDOM.blur();
          }}
        />
      )}
    </div>
  );
});

function getExtensions({
  container,
  readOnly,
  singleLine,
  onChange,
  onFocus,
}: Pick<EditorProps, 'singleLine' | 'readOnly'> & {
  container: HTMLDivElement | null;
  onChange: MutableRefObject<EditorProps['onChange']>;
  onFocus: MutableRefObject<EditorProps['onFocus']>;
}) {
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
    ...(readOnly ? [EditorState.readOnly.of(true)] : []),
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
      if (onChange && update.docChanged && isViewUpdateFromUserInput(update)) {
        onChange.current?.(update.state.doc.toString());
      }
    }),
  ];
}

function isViewUpdateFromUserInput(viewUpdate: ViewUpdate) {
  // Make sure document has changed, ensuring user events like selections don't count.
  if (viewUpdate.docChanged) {
    // Check transactions for any that are direct user input, not changes from Y.js or another extension.
    for (const transaction of viewUpdate.transactions) {
      // Not using Transaction.isUserEvent because that only checks for a specific User event type ( "input", "delete", etc.). Checking the annotation directly allows for any type of user event.
      const userEventType = transaction.annotation(Transaction.userEvent);
      if (userEventType) return userEventType;
    }
  }

  return false;
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

const placeholderElFromText = (text: string) => {
  const el = document.createElement('div');
  el.innerHTML = text.replace('\n', '<br/>');
  return el;
};
