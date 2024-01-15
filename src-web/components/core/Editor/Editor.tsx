import { defaultKeymap } from '@codemirror/commands';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import classNames from 'classnames';
import { EditorView } from 'codemirror';
import type { MutableRefObject, ReactNode } from 'react';
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { useActiveEnvironment } from '../../../hooks/useActiveEnvironment';
import { useActiveWorkspace } from '../../../hooks/useActiveWorkspace';
import { IconButton } from '../IconButton';
import { HStack } from '../Stacks';
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
  contentType?: string | null;
  forceUpdateKey?: string;
  autoFocus?: boolean;
  autoSelect?: boolean;
  defaultValue?: string | null;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  singleLine?: boolean;
  wrapLines?: boolean;
  format?: (v: string) => string;
  autocomplete?: GenericCompletionConfig;
  autocompleteVariables?: boolean;
  actions?: ReactNode;
}

const _Editor = forwardRef<EditorView | undefined, EditorProps>(function Editor(
  {
    readOnly,
    type = 'text',
    heightMode,
    contentType,
    autoFocus,
    autoSelect,
    placeholder,
    useTemplating,
    defaultValue,
    forceUpdateKey,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    className,
    singleLine,
    format,
    autocomplete,
    autocompleteVariables,
    actions,
    wrapLines,
  }: EditorProps,
  ref,
) {
  const e = useActiveEnvironment();
  const w = useActiveWorkspace();
  const environment = autocompleteVariables ? e : null;
  const workspace = autocompleteVariables ? w : null;

  const cm = useRef<{ view: EditorView; languageCompartment: Compartment } | null>(null);
  useImperativeHandle(ref, () => cm.current?.view);

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

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleBlur = useRef<EditorProps['onBlur']>(onBlur);
  useEffect(() => {
    handleBlur.current = onBlur;
  }, [onBlur]);

  // Use ref so we can update the onChange handler without re-initializing the editor
  const handleKeyDown = useRef<EditorProps['onKeyDown']>(onKeyDown);
  useEffect(() => {
    handleKeyDown.current = onKeyDown;
  }, [onKeyDown]);

  // Update placeholder
  const placeholderCompartment = useRef(new Compartment());
  useEffect(() => {
    if (cm.current === null) return;
    const effect = placeholderCompartment.current.reconfigure(
      placeholderExt(placeholderElFromText(placeholder ?? '')),
    );
    cm.current?.view.dispatch({ effects: effect });
  }, [placeholder]);

  // Update wrap lines
  const wrapLinesCompartment = useRef(new Compartment());
  useEffect(() => {
    if (cm.current === null) return;
    const ext = wrapLines ? [EditorView.lineWrapping] : [];
    const effect = wrapLinesCompartment.current.reconfigure(ext);
    cm.current?.view.dispatch({ effects: effect });
  }, [wrapLines]);

  // Update language extension when contentType changes
  useEffect(() => {
    if (cm.current === null) return;
    const { view, languageCompartment } = cm.current;
    const ext = getLanguageExtension({
      contentType,
      environment,
      workspace,
      useTemplating,
      autocomplete,
    });
    view.dispatch({ effects: languageCompartment.reconfigure(ext) });
  }, [contentType, autocomplete, useTemplating, environment, workspace]);

  useEffect(() => {
    if (cm.current === null) return;
    const { view } = cm.current;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: defaultValue ?? '' } });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdateKey]);

  // Initialize the editor when ref mounts
  const initEditorRef = useCallback((container: HTMLDivElement | null) => {
    if (container === null) {
      cm.current?.view.destroy();
      cm.current = null;
      return;
    }

    let view: EditorView;
    try {
      const languageCompartment = new Compartment();
      const langExt = getLanguageExtension({
        contentType,
        useTemplating,
        autocomplete,
        environment,
        workspace,
      });

      const state = EditorState.create({
        doc: `${defaultValue ?? ''}`,
        extensions: [
          languageCompartment.of(langExt),
          placeholderCompartment.current.of([]),
          wrapLinesCompartment.current.of([]),
          ...getExtensions({
            container,
            readOnly,
            singleLine,
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
          }),
        ],
      });

      view = new EditorView({ state, parent: container });
      cm.current = { view, languageCompartment };
      syncGutterBg({ parent: container, className });
      if (autoFocus) {
        view.focus();
      }
      if (autoSelect) {
        view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
      }
    } catch (e) {
      console.log('Failed to initialize Codemirror', e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cmContainer = (
    <div
      ref={initEditorRef}
      className={classNames(
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
      {(format || actions) && (
        <HStack
          space={1}
          alignItems="center"
          justifyContent="end"
          className="absolute bottom-2 left-0 right-0"
        >
          {format && (
            <IconButton
              showConfirm
              size="sm"
              title="Reformat contents"
              icon="magicWand"
              className="transition-all opacity-0 group-hover:opacity-100"
              onClick={() => {
                if (cm.current === null) return;
                const { doc } = cm.current.view.state;
                const formatted = format(doc.toString());
                // Update editor and blur because the cursor will reset anyway
                cm.current.view.dispatch({
                  changes: { from: 0, to: doc.length, insert: formatted },
                });
                cm.current.view.contentDOM.blur();
                // Fire change event
                onChange?.(formatted);
              }}
            />
          )}
          {actions}
        </HStack>
      )}
    </div>
  );
});

export const Editor = memo(_Editor);

function getExtensions({
  container,
  readOnly,
  singleLine,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
}: Pick<EditorProps, 'singleLine' | 'readOnly'> & {
  container: HTMLDivElement | null;
  onChange: MutableRefObject<EditorProps['onChange']>;
  onFocus: MutableRefObject<EditorProps['onFocus']>;
  onBlur: MutableRefObject<EditorProps['onBlur']>;
  onKeyDown: MutableRefObject<EditorProps['onKeyDown']>;
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
    ...(readOnly
      ? [EditorState.readOnly.of(true), EditorView.contentAttributes.of({ tabindex: '-1' })]
      : []),

    // Handle onFocus
    // NOTE: These *must* be anonymous functions so the references update properly
    EditorView.domEventHandlers({
      focus: () => onFocus.current?.(),
      blur: () => onBlur.current?.(),
      keydown: (e) => onKeyDown.current?.(e),
    }),

    // Handle onChange
    EditorView.updateListener.of((update) => {
      // Only fire onChange if the document changed and the update was from user input. This prevents firing onChange when the document is updated when
      // changing pages (one request to another in header editor)
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
