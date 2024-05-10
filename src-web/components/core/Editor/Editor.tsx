import { defaultKeymap } from '@codemirror/commands';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import classNames from 'classnames';
import { EditorView } from 'codemirror';
import type { MutableRefObject, ReactNode } from 'react';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
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
  forceUpdateKey?: string | number;
  autoFocus?: boolean;
  autoSelect?: boolean;
  defaultValue?: string | null;
  placeholder?: string;
  tooltipContainer?: HTMLElement;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onPaste?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  singleLine?: boolean;
  wrapLines?: boolean;
  format?: (v: string) => string;
  autocomplete?: GenericCompletionConfig;
  autocompleteVariables?: boolean;
  extraExtensions?: Extension[];
  actions?: ReactNode;
}

export const Editor = forwardRef<EditorView | undefined, EditorProps>(function Editor(
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
    onPaste,
    onFocus,
    onBlur,
    onKeyDown,
    className,
    singleLine,
    format,
    autocomplete,
    extraExtensions,
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

  // Use ref so we can update the handler without re-initializing the editor
  const handleChange = useRef<EditorProps['onChange']>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  // Use ref so we can update the handler without re-initializing the editor
  const handlePaste = useRef<EditorProps['onPaste']>(onPaste);
  useEffect(() => {
    handlePaste.current = onPaste;
  }, [onPaste]);

  // Use ref so we can update the handler without re-initializing the editor
  const handleFocus = useRef<EditorProps['onFocus']>(onFocus);
  useEffect(() => {
    handleFocus.current = onFocus;
  }, [onFocus]);

  // Use ref so we can update the handler without re-initializing the editor
  const handleBlur = useRef<EditorProps['onBlur']>(onBlur);
  useEffect(() => {
    handleBlur.current = onBlur;
  }, [onBlur]);

  // Use ref so we can update the handler without re-initializing the editor
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

  const classList = className?.split(/\s+/) ?? [];
  const bgClassList = classList
    .filter((c) => c.match(/(^|:)?bg-.+/)) // Find bg-* classes
    .map((c) => c.replace(/^bg-/, '!bg-')) // !important
    .map((c) => c.replace(/^dark:bg-/, 'dark:!bg-')); // !important

  // Initialize the editor when ref mounts
  const initEditorRef = useCallback(
    (container: HTMLDivElement | null) => {
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
            placeholderCompartment.current.of(
              placeholderExt(placeholderElFromText(placeholder ?? '')),
            ),
            wrapLinesCompartment.current.of([]),
            ...getExtensions({
              container,
              readOnly,
              singleLine,
              onChange: handleChange,
              onPaste: handlePaste,
              onFocus: handleFocus,
              onBlur: handleBlur,
              onKeyDown: handleKeyDown,
            }),
            ...(extraExtensions ?? []),
          ],
        });

        view = new EditorView({ state, parent: container });
        cm.current = { view, languageCompartment };
        syncGutterBg({ parent: container, bgClassList });
        if (autoFocus) {
          view.focus();
        }
        if (autoSelect) {
          view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
        }
      } catch (e) {
        console.log('Failed to initialize Codemirror', e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forceUpdateKey],
  );

  // Add bg classes to actions, so they appear over the text
  const decoratedActions = useMemo(() => {
    const results = [];
    const actionClassName = classNames(
      'transition-opacity opacity-0 group-hover:opacity-80 hover:!opacity-100 shadow',
      bgClassList,
    );

    if (format) {
      results.push(
        <IconButton
          showConfirm
          key="format"
          size="sm"
          title="Reformat contents"
          icon="magicWand"
          className={classNames(actionClassName)}
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
        />,
      );
    }
    results.push(
      Children.map(actions, (existingChild) => {
        if (!isValidElement(existingChild)) return null;
        return cloneElement(existingChild, {
          ...existingChild.props,
          className: classNames(existingChild.props.className, actionClassName),
        });
      }),
    );
    return results;
  }, [actions, bgClassList, format, onChange]);

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
      {decoratedActions && (
        <HStack
          space={1}
          alignItems="center"
          justifyContent="end"
          className={classNames(
            'absolute bottom-2 left-0 right-0',
            'pointer-events-none', // No pointer events so we don't block the editor
          )}
        >
          {decoratedActions}
        </HStack>
      )}
    </div>
  );
});

function getExtensions({
  container,
  readOnly,
  singleLine,
  onChange,
  onPaste,
  onFocus,
  onBlur,
  onKeyDown,
}: Pick<EditorProps, 'singleLine' | 'readOnly'> & {
  container: HTMLDivElement | null;
  onChange: MutableRefObject<EditorProps['onChange']>;
  onPaste: MutableRefObject<EditorProps['onPaste']>;
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
    // NOTE: These *must* be anonymous functions so the references update properly
    EditorView.domEventHandlers({
      focus: () => {
        onFocus.current?.();
      },
      blur: () => {
        onBlur.current?.();
      },
      keydown: (e) => {
        onKeyDown.current?.(e);
      },
      paste: (e) => {
        onPaste.current?.(e.clipboardData?.getData('text/plain') ?? '');
      },
    }),
    tooltips({ parent }),
    keymap.of(singleLine ? defaultKeymap.filter((k) => k.key !== 'Enter') : defaultKeymap),
    ...(singleLine ? [singleLineExt()] : []),
    ...(!singleLine ? [multiLineExtensions] : []),
    ...(readOnly
      ? [EditorState.readOnly.of(true), EditorView.contentAttributes.of({ tabindex: '-1' })]
      : []),

    // Handle onChange
    EditorView.updateListener.of((update) => {
      if (onChange && update.docChanged) {
        onChange.current?.(update.state.doc.toString());
      }
    }),

    ...baseExtensions,
  ];
}

const syncGutterBg = ({
  parent,
  bgClassList,
}: {
  parent: HTMLDivElement;
  bgClassList: string[];
}) => {
  const gutterEl = parent.querySelector<HTMLDivElement>('.cm-gutters');
  if (gutterEl) {
    gutterEl?.classList.add(...bgClassList);
  }
};

const placeholderElFromText = (text: string) => {
  const el = document.createElement('div');
  el.innerHTML = text.replace('\n', '<br/>');
  return el;
};
