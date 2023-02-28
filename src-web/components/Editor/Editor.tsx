import './Editor.css';
import { HTMLAttributes, useEffect, useMemo, useRef } from 'react';
import { EditorView } from 'codemirror';
import { baseExtensions, multiLineExtensions, syntaxExtension } from './extensions';
import { EditorState, Transaction, EditorSelection } from '@codemirror/state';
import type { TransactionSpec } from '@codemirror/state';
import classnames from 'classnames';
import { autocompletion } from '@codemirror/autocomplete';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  contentType: string;
  useTemplating?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  singleLine?: boolean;
}

export default function Editor({
  contentType,
  useTemplating,
  defaultValue,
  onChange,
  onSubmit,
  className,
  singleLine,
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const extensions = useMemo(() => {
    const ext = syntaxExtension({ contentType, useTemplating });
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
                console.log('GOT PASTE', tr);

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
  }, [contentType]);

  useEffect(() => {
    if (ref.current === null) return;

    let view: EditorView;
    try {
      view = new EditorView({
        state: EditorState.create({
          doc: `${defaultValue ?? ''}`,
          extensions: extensions,
        }),
        parent: ref.current,
      });
    } catch (e) {
      console.log(e);
    }
    return () => view?.destroy();
  }, [ref.current]);

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
