import { defaultKeymap } from '@codemirror/commands';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { keymap, placeholder as placeholderExt, tooltips } from '@codemirror/view';
import type { EnvironmentVariable } from '@yaakapp/api';
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
import { useSettings } from '../../../hooks/useSettings';
import { type TemplateFunction, useTemplateFunctions } from '../../../hooks/useTemplateFunctions';
import { useDialog } from '../../DialogContext';
import { TemplateFunctionDialog } from '../../TemplateFunctionDialog';
import { TemplateVariableDialog } from '../../TemplateVariableDialog';
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
  const s = useSettings();
  const [e] = useActiveEnvironment();
  const templateFunctions = useTemplateFunctions();
  const w = useActiveWorkspace();
  const environment = autocompleteVariables ? e : null;
  const workspace = autocompleteVariables ? w : null;

  if (s && wrapLines === undefined) {
    wrapLines = s.editorSoftWrap;
  }

  const cm = useRef<{ view: EditorView; languageCompartment: Compartment } | null>(null);
  useImperativeHandle(ref, () => cm.current?.view);

  // Use ref so we can update the handler without re-initializing the editor
  const handleChange = useRef<EditorProps['onChange']>(onChange);
  useEffect(() => {
    handleChange.current = onChange ? onChange : onChange;
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

  const dialog = useDialog();
  const onClickFunction = useCallback(
    (fn: TemplateFunction) => {
      dialog.show({
        id: 'template-function',
        size: 'dynamic',
        title: 'Configure Function',
        render: ({ hide }) => <TemplateFunctionDialog templateFunction={fn} hide={hide} />,
      });
    },
    [dialog],
  );

  const onClickVariable = useCallback(
    (v: EnvironmentVariable) => {
      dialog.show({
        size: 'dynamic',
        id: 'template-variable',
        title: 'Configure Variable',
        render: ({ hide }) => <TemplateVariableDialog variable={v} hide={hide} />,
      });
    },
    [dialog],
  );

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
      templateFunctions,
      onClickFunction,
      onClickVariable,
    });
    view.dispatch({ effects: languageCompartment.reconfigure(ext) });
  }, [
    contentType,
    autocomplete,
    useTemplating,
    environment,
    workspace,
    templateFunctions,
    onClickFunction,
    onClickVariable,
  ]);

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
          templateFunctions,
          onClickVariable,
          onClickFunction,
        });

        const state = EditorState.create({
          doc: `${defaultValue ?? ''}`,
          extensions: [
            languageCompartment.of(langExt),
            placeholderCompartment.current.of(
              placeholderExt(placeholderElFromText(placeholder ?? '')),
            ),
            wrapLinesCompartment.current.of(wrapLines ? [EditorView.lineWrapping] : []),
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
      'bg-surface transition-opacity opacity-0 group-hover:opacity-100 hover:!opacity-100 shadow',
    );

    if (format) {
      results.push(
        <IconButton
          showConfirm
          key="format"
          size="sm"
          title="Reformat contents"
          icon="magicWand"
          variant="border"
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
  }, [actions, format, onChange]);

  const cmContainer = (
    <div
      ref={initEditorRef}
      className={classNames(
        className,
        'cm-wrapper text-base',
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
    <div className="group relative h-full w-full x-theme-editor bg-surface">
      {cmContainer}
      {decoratedActions && (
        <HStack
          space={1}
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
    ...baseExtensions, // Must be first
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

    // ------------------------ //
    // Things that must be last //
    // ------------------------ //

    EditorView.updateListener.of((update) => {
      if (onChange && update.docChanged) {
        onChange.current?.(update.state.doc.toString());
      }
    }),
  ];
}

const placeholderElFromText = (text: string) => {
  const el = document.createElement('div');
  el.innerHTML = text.replace('\n', '<br/>');
  return el;
};
