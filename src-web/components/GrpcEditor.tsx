import type { EditorView } from 'codemirror';
import { updateSchema } from 'codemirror-json-schema';
import { useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import type { ReflectResponseService } from '../hooks/useGrpc';
import { tryFormatJson } from '../lib/formatters';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';
import { FormattedError } from './core/FormattedError';
import { InlineCode } from './core/InlineCode';
import { HStack, VStack } from './core/Stacks';
import { useDialog } from './DialogContext';

type Props = Pick<
  EditorProps,
  'heightMode' | 'onChange' | 'defaultValue' | 'className' | 'forceUpdateKey'
> & {
  url: string;
  service: string | null;
  method: string | null;
  services: ReflectResponseService[] | null;
  reflectionError?: string;
  reflectionLoading?: boolean;
  onReflect: () => void;
};

export function GrpcEditor({
  service,
  method,
  services,
  defaultValue,
  reflectionError,
  reflectionLoading,
  onReflect,
  ...extraEditorProps
}: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const alert = useAlert();
  const dialog = useDialog();

  useEffect(() => {
    if (editorViewRef.current == null || services === null) return;

    const s = services?.find((s) => s.name === service);
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
  }, [alert, services, method, service]);

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        contentType="application/grpc"
        defaultValue={defaultValue}
        format={tryFormatJson}
        heightMode="auto"
        placeholder="..."
        ref={editorViewRef}
        actions={
          reflectionError || reflectionLoading
            ? [
                <div key="introspection" className="!opacity-100">
                  <Button
                    key="introspection"
                    size="xs"
                    color={reflectionError ? 'danger' : 'gray'}
                    isLoading={reflectionLoading}
                    onClick={() => {
                      dialog.show({
                        title: 'Introspection Failed',
                        size: 'dynamic',
                        id: 'introspection-failed',
                        render: () => (
                          <>
                            <FormattedError>{reflectionError ?? 'unknown'}</FormattedError>
                            <HStack className="w-full my-4" space={2} justifyContent="end">
                              <Button color="gray">Select .proto</Button>
                              <Button
                                onClick={() => {
                                  dialog.hide('introspection-failed');
                                  onReflect();
                                }}
                                color="secondary"
                              >
                                Try Again
                              </Button>
                            </HStack>
                          </>
                        ),
                      });
                    }}
                  >
                    {reflectionError ? 'Reflection Failed' : 'Reflecting'}
                  </Button>
                </div>,
              ]
            : []
        }
        {...extraEditorProps}
      />
    </div>
  );
}
