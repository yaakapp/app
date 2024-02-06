import { open } from '@tauri-apps/api/dialog';
import type { EditorView } from 'codemirror';
import { updateSchema } from 'codemirror-json-schema';
import { useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import type { ReflectResponseService } from '../hooks/useGrpc';
import { tryFormatJson } from '../lib/formatters';
import type { GrpcRequest } from '../lib/models';
import { count } from '../lib/pluralize';
import { Banner } from './core/Banner';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';
import { FormattedError } from './core/FormattedError';
import { InlineCode } from './core/InlineCode';
import { Link } from './core/Link';
import { HStack, VStack } from './core/Stacks';
import { useDialog } from './DialogContext';
import { GrpcProtoSelection } from './GrpcProtoSelection';

type Props = Pick<EditorProps, 'heightMode' | 'onChange' | 'className'> & {
  services: ReflectResponseService[] | null;
  reflectionError?: string;
  reflectionLoading?: boolean;
  request: GrpcRequest;
  onReflect: () => void;
  onSelectProtoFiles: (paths: string[]) => void;
};

export function GrpcEditor({
  services,
  reflectionError,
  reflectionLoading,
  onReflect,
  onSelectProtoFiles,
  request,
  ...extraEditorProps
}: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const alert = useAlert();
  const dialog = useDialog();

  // Find the schema for the selected service and method and update the editor
  useEffect(() => {
    if (editorViewRef.current == null || services === null) return;

    const s = services.find((s) => s.name === request.service);
    if (request.service != null && s == null) {
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

    const schema = s?.methods.find((m) => m.name === request.method)?.schema;
    if (request.method != null && schema == null) {
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
        forceUpdateKey={request.id}
        defaultValue={request.message}
        format={tryFormatJson}
        heightMode="auto"
        placeholder="..."
        ref={editorViewRef}
        actions={[
          <div key="reflection" className="!opacity-100">
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
                  render: ({ hide }) => (
                    <VStack space={6} className="pb-5">
                      {reflectionError && <FormattedError>{reflectionError}</FormattedError>}
                      {reflectionUnavailable && request.protoFiles.length === 0 && (
                        <Banner>
                          <VStack space={3}>
                            <p>
                              <InlineCode>{request.url}</InlineCode> doesn&apos;t implement{' '}
                              <Link href="https://github.com/grpc/grpc/blob/9aa3c5835a4ed6afae9455b63ed45c761d695bca/doc/server-reflection.md">
                                Server Reflection
                              </Link>{' '}
                              . Please manually add the <InlineCode>.proto</InlineCode> files to get
                              started.
                            </p>
                            <div>
                              <Button
                                size="xs"
                                color="gray"
                                variant="border"
                                onClick={() => {
                                  hide();
                                  onReflect();
                                }}
                              >
                                Retry Reflection
                              </Button>
                            </div>
                          </VStack>
                        </Banner>
                      )}
                      <GrpcProtoSelection requestId={request.id} />
                    </VStack>
                  ),
                });
              }}
            >
              {reflectionLoading
                ? 'Inspecting Schema'
                : reflectionUnavailable
                ? 'Select Proto Files'
                : reflectionError
                ? 'Server Error'
                : services != null
                ? 'Proto Schema'
                : request.protoFiles.length > 0
                ? count('Proto File', request.protoFiles.length)
                : 'Select Schema'}
            </Button>
          </div>,
        ]}
        {...extraEditorProps}
      />
    </div>
  );
}
