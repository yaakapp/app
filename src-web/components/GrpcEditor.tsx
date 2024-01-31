import type { EditorView } from 'codemirror';
import { updateSchema } from 'codemirror-json-schema';
import { useEffect, useRef } from 'react';
import { useGrpc } from '../hooks/useGrpc';
import { tryFormatJson } from '../lib/formatters';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';

type Props = Pick<
  EditorProps,
  'heightMode' | 'onChange' | 'defaultValue' | 'className' | 'forceUpdateKey'
> & {
  url: string;
};

export function GrpcEditor({ url, defaultValue, ...extraEditorProps }: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const { schema } = useGrpc(url);

  useEffect(() => {
    if (editorViewRef.current == null || schema == null) return;
    const foo = schema[0].methods[0].schema;
    console.log('UPDATE SCHEMA', foo);
    updateSchema(editorViewRef.current, JSON.parse(foo));
  }, [schema]);

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        contentType="application/grpc"
        defaultValue={defaultValue}
        format={tryFormatJson}
        heightMode="auto"
        placeholder="..."
        ref={editorViewRef}
        {...extraEditorProps}
      />
    </div>
  );
}
