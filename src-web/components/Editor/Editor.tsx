import './Editor.css';
import { HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { EditorView } from 'codemirror';
import { baseExtensions, getLanguageExtension, multiLineExtensions } from './extensions';
import type { TransactionSpec } from '@codemirror/state';
import { Compartment, EditorSelection, EditorState, Transaction } from '@codemirror/state';
import classnames from 'classnames';
import { autocompletion } from '@codemirror/autocomplete';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  contentType: string;
  valueKey?: string;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  singleLine?: boolean;
}

export default function Editor({
  contentType,
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
    () => getExtensions({ onSubmit, singleLine, onChange, contentType, useTemplating }),
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
  }, [ref.current]);

  // Update value when valueKey changes
  useEffect(() => {
    if (cm === null) return;
    cm.view.dispatch({
      changes: { from: 0, to: cm.view.state.doc.length, insert: `${defaultValue ?? ''}` },
    });
  }, [valueKey]);

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
  onChange,
  onSubmit,
  contentType,
  useTemplating,
}: Pick<Props, 'singleLine' | 'onChange' | 'onSubmit' | 'contentType' | 'useTemplating'>) {
  const ext = getLanguageExtension({ contentType, useTemplating });
  return [
    autocompletion(),
    ...(singleLine
      ? [
          EditorView.domEventHandlers({
            keydown: (e) => {
              // TODO: Figure out how to not have this mess up autocomplete
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit?.();
              }
            },
          }),
          EditorState.transactionFilter.of(
            (tr: Transaction): TransactionSpec | TransactionSpec[] => {
              if (!tr.isUserEvent('input.paste')) {
                return tr;
              }

              // let addedNewline = false;
              const trs: TransactionSpec[] = [];
              tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                // console.log('CHANGE', { fromA, toA }, { fromB, toB }, inserted);
                let insert = '';
                for (const line of inserted) {
                  insert += line.replace('\n', '');
                }
                trs.push({
                  ...tr,
                  selection: undefined,
                  changes: [{ from: fromB, to: toA, insert }],
                });
              });

              // selection: EditorSelection.create([EditorSelection.cursor(8)], 1),
              // console.log('TRS', trs, tr);
              trs.push({
                selection: EditorSelection.create([EditorSelection.cursor(8)], 1),
              });
              return trs;
              // return addedNewline ? [] : tr;
            },
          ),
        ]
      : []),
    ...baseExtensions,
    ...(!singleLine ? [multiLineExtensions] : []),
    ...(ext ? [ext] : []),
    EditorView.updateListener.of((update) => {
      if (typeof onChange === 'function') {
        onChange(update.state.doc.toString());
      }
    }),
  ];
}
