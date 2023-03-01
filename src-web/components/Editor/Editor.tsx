import type { Transaction, TransactionSpec } from '@codemirror/state';
import { Compartment, EditorSelection, EditorState, Prec } from '@codemirror/state';
import { placeholder as placeholderExt } from '@codemirror/view';
import classnames from 'classnames';
import { EditorView } from 'codemirror';
import type { HTMLAttributes } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './Editor.css';
import { baseExtensions, getLanguageExtension, multiLineExtensions } from './extensions';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  contentType: string;
  valueKey?: string;
  placeholder?: string;
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
      getExtensions({ placeholder, onSubmit, singleLine, onChange, contentType, useTemplating }),
    [contentType],
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
  singleLine,
  placeholder,
  onChange,
  onSubmit,
  contentType,
  useTemplating,
}: Pick<
  Props,
  'singleLine' | 'onChange' | 'onSubmit' | 'contentType' | 'useTemplating' | 'placeholder'
>) {
  const ext = getLanguageExtension({ contentType, useTemplating });
  return [
    ...(singleLine
      ? [
          Prec.high(
            EditorView.domEventHandlers({
              keydown: (e) => {
                // TODO: Figure out how to not have this not trigger on autocomplete selection
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmit?.();
                }
              },
            }),
          ),
          EditorState.transactionFilter.of(
            (tr: Transaction): TransactionSpec | TransactionSpec[] => {
              if (!tr.isUserEvent('input.paste')) return tr;

              const trs: TransactionSpec[] = [];
              tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                let insert = '';
                for (const line of inserted) {
                  insert += line.replace('\n', '');
                }
                const changes = [{ from: fromB, to: toA, insert }];
                // Update selection now that the text has been changed
                const selection = EditorSelection.create([EditorSelection.cursor(toB - 1)], 0);
                trs.push({ ...tr, selection, changes });
              });
              return trs;
            },
          ),
        ]
      : []),
    ...baseExtensions,
    ...(!singleLine ? [multiLineExtensions] : []),
    ...(ext ? [ext] : []),
    ...(placeholder ? [placeholderExt(placeholder)] : []),
    EditorView.updateListener.of((update) => {
      if (typeof onChange === 'function' && update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];
}
