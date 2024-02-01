import type { EditorView } from 'codemirror';
import { updateSchema } from 'codemirror-json-schema';
import { useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import { useGrpc } from '../hooks/useGrpc';
import { tryFormatJson } from '../lib/formatters';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';
import { FormattedError } from './core/FormattedError';
import { InlineCode } from './core/InlineCode';
import { VStack } from './core/Stacks';

type Props = Pick<
  EditorProps,
  'heightMode' | 'onChange' | 'defaultValue' | 'className' | 'forceUpdateKey'
> & {
  url: string;
  service: string | null;
  method: string | null;
};

export function GrpcEditor({ url, service, method, defaultValue, ...extraEditorProps }: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const grpc = useGrpc(url);
  const alert = useAlert();

  useEffect(() => {
    if (editorViewRef.current == null || grpc.schema == null) return;
    const s = grpc.schema?.find((s) => s.name === service);
    if (service != null && s == null) {
      alert({
        id: 'grpc-find-service-error',
        title: "Couldn't Find Service",
        body: (
          <>
            Failed to find service <InlineCode>{service}</InlineCode> in schema
          </>
        ),
      });
      return;
    }

    const schema = s?.methods.find((m) => m.name === method)?.schema;
    if (method != null && schema == null) {
      alert({
        id: 'grpc-find-schema-error',
        title: "Couldn't Find Method",
        body: (
          <>
            Failed to find method <InlineCode>{method}</InlineCode> for{' '}
            <InlineCode>{service}</InlineCode> in schema
          </>
        ),
      });
      return;
    }

    if (schema == null) {
      return;
    }

    try {
      updateSchema(editorViewRef.current, JSON.parse(schema));
    } catch (err) {
      alert({
        id: 'grpc-parse-schema-error',
        title: 'Failed to Parse Schema',
        body: (
          <VStack space={4}>
            <p>
              For service <InlineCode>{service}</InlineCode> and method{' '}
              <InlineCode>{method}</InlineCode>
            </p>
            <FormattedError>{String(err)}</FormattedError>
          </VStack>
        ),
      });
      console.log('Failed to parse method schema', method, schema);
    }
  }, [alert, grpc.schema, method, service]);

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
