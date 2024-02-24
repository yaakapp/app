import classNames from 'classnames';
import type { EditorView } from 'codemirror';
import { updateSchema } from 'codemirror-json-schema';
import { useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import type { ReflectResponseService } from '../hooks/useGrpc';
import { tryFormatJson } from '../lib/formatters';
import type { GrpcRequest } from '../lib/models';
import { count } from '../lib/pluralize';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';
import { FormattedError } from './core/FormattedError';
import { InlineCode } from './core/InlineCode';
import { VStack } from './core/Stacks';
import { useDialog } from './DialogContext';
import { GrpcProtoSelection } from './GrpcProtoSelection';

type Props = Pick<EditorProps, 'heightMode' | 'onChange' | 'className'> & {
  services: ReflectResponseService[] | null;
  reflectionError?: string;
  reflectionLoading?: boolean;
  request: GrpcRequest;
  protoFiles: string[];
};

export function GrpcEditor({
  services,
  reflectionError,
  reflectionLoading,
  request,
  protoFiles,
  ...extraEditorProps
}: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const alert = useAlert();
  const dialog = useDialog();

  // Find the schema for the selected service and method and update the editor
  useEffect(() => {
    if (
      editorViewRef.current == null ||
      services === null ||
      request.service === null ||
      request.method === null
    ) {
      return;
    }

    const s = services.find((s) => s.name === request.service);
    if (s == null) {
      console.log('Failed to find service', { service: request.service, services });
      alert({
        id: 'grpc-find-service-error',
        title: "Couldn't Find Service",
        body: (
          <>
            Failed to find service <InlineCode>{request.service}</InlineCode> in schema
          </>
        ),
      });
      return;
    }

    const schema = s.methods.find((m) => m.name === request.method)?.schema;
    if (request.method != null && schema == null) {
      console.log('Failed to find method', { method: request.method, methods: s?.methods });
      alert({
        id: 'grpc-find-schema-error',
        title: "Couldn't Find Method",
        body: (
          <>
            Failed to find method <InlineCode>{request.method}</InlineCode> for{' '}
            <InlineCode>{request.service}</InlineCode> in schema
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
              For service <InlineCode>{request.service}</InlineCode> and method{' '}
              <InlineCode>{request.method}</InlineCode>
            </p>
            <FormattedError>{String(err)}</FormattedError>
          </VStack>
        ),
      });
    }
  }, [alert, services, request.method, request.service]);

  const reflectionUnavailable = reflectionError?.match(/unimplemented/i);
  reflectionError = reflectionUnavailable ? undefined : reflectionError;

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        contentType="application/grpc"
        autocompleteVariables
        useTemplating
        forceUpdateKey={request.id}
        defaultValue={request.message}
        format={tryFormatJson}
        heightMode="auto"
        placeholder="..."
        ref={editorViewRef}
        actions={[
          <div key="reflection" className={classNames(services == null && '!opacity-100')}>
            <Button
              size="xs"
              color={
                reflectionLoading
                  ? 'gray'
                  : reflectionUnavailable
                  ? 'secondary'
                  : reflectionError
                  ? 'danger'
                  : 'gray'
              }
              isLoading={reflectionLoading}
              onClick={() => {
                dialog.show({
                  title: 'Configure Schema',
                  size: 'md',
                  id: 'reflection-failed',
                  render: ({ hide }) => {
                    return (
                      <VStack space={6} className="pb-5">
                        <GrpcProtoSelection onDone={hide} requestId={request.id} />
                      </VStack>
                    );
                  },
                });
              }}
            >
              {reflectionLoading
                ? 'Inspecting Schema'
                : reflectionUnavailable
                ? 'Select Proto Files'
                : reflectionError
                ? 'Server Error'
                : protoFiles.length > 0
                ? count('File', protoFiles.length)
                : services != null && protoFiles.length === 0
                ? 'Schema Detected'
                : 'Select Schema'}
            </Button>
          </div>,
        ]}
        {...extraEditorProps}
      />
    </div>
  );
}
