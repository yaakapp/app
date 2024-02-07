import { open } from '@tauri-apps/api/dialog';
import { useGrpc } from '../hooks/useGrpc';
import { useGrpcRequest } from '../hooks/useGrpcRequest';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { count } from '../lib/pluralize';
import { Banner } from './core/Banner';
import { Button } from './core/Button';
import { FormattedError } from './core/FormattedError';
import { IconButton } from './core/IconButton';
import { InlineCode } from './core/InlineCode';
import { Link } from './core/Link';
import { HStack, VStack } from './core/Stacks';

interface Props {
  requestId: string;
  onDone: () => void;
}

export function GrpcProtoSelection({ requestId }: Props) {
  const request = useGrpcRequest(requestId);
  const grpc = useGrpc(request, null);
  const updateRequest = useUpdateGrpcRequest(request?.id ?? null);
  const services = grpc.reflect.data;
  const serverReflection = request?.protoFiles.length === 0 && services != null;
  let reflectError = grpc.reflect.error ?? null;
  const reflectionUnimplemented = `${reflectError}`.match(/unimplemented/i);

  if (reflectionUnimplemented) {
    reflectError = null;
  }

  if (request == null) {
    return null;
  }

  return (
    <VStack className="flex-col-reverse" space={3}>
      {/* Buttons on top so they get focus first */}
      <HStack space={2} justifyContent="start" className="flex-row-reverse">
        <Button
          color="primary"
          size="sm"
          onClick={async () => {
            const files = await open({
              title: 'Select Proto Files',
              multiple: true,
              filters: [{ name: 'Proto Files', extensions: ['proto'] }],
            });
            if (files == null || typeof files === 'string') return;
            const newFiles = files.filter((f) => !request.protoFiles.includes(f));
            await updateRequest.mutateAsync({ protoFiles: [...request.protoFiles, ...newFiles] });
            await grpc.reflect.refetch();
          }}
        >
          Add Files
        </Button>
        <Button
          isLoading={grpc.reflect.isFetching}
          disabled={grpc.reflect.isFetching}
          color="gray"
          size="sm"
          onClick={() => grpc.reflect.refetch()}
        >
          Refresh Schema
        </Button>
      </HStack>
      <VStack space={5}>
        {!serverReflection && services != null && services.length > 0 && (
          <Banner className="flex flex-col gap-2">
            <p>
              Found services
              {services?.slice(0, 5).map((s, i) => {
                return (
                  <span key={i}>
                    <InlineCode>{s.name}</InlineCode>
                    {i === services.length - 1 ? '' : i === services.length - 2 ? ' and ' : ', '}
                  </span>
                );
              })}
              {services?.length > 5 && count('other', services?.length - 5)}
            </p>
          </Banner>
        )}
        {serverReflection && services != null && services.length > 0 && (
          <Banner className="flex flex-col gap-2">
            <p>
              Server reflection found services
              {services?.map((s, i) => {
                return (
                  <span key={i}>
                    <InlineCode>{s.name}</InlineCode>
                    {i === services.length - 1 ? '' : i === services.length - 2 ? ' and ' : ', '}
                  </span>
                );
              })}
              . You can override this schema by manually selecting <InlineCode>*.proto</InlineCode>{' '}
              files.
            </p>
          </Banner>
        )}

        {request.protoFiles.length > 0 && (
          <table className="w-full divide-y">
            <thead>
              <tr>
                <th className="text-gray-600">
                  <span className="font-mono text-sm">*.proto</span> Files
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {request.protoFiles.map((f, i) => (
                <tr key={f + i} className="group">
                  <td className="pl-1 text-sm font-mono">{f.split('/').pop()}</td>
                  <td className="w-0 py-0.5">
                    <IconButton
                      title="Remove file"
                      size="sm"
                      icon="trash"
                      className="ml-auto opacity-30 transition-opacity group-hover:opacity-100"
                      onClick={async () => {
                        await updateRequest.mutateAsync({
                          protoFiles: request.protoFiles.filter((p) => p !== f),
                        });
                        grpc.reflect.remove();
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {reflectError && <FormattedError>{reflectError}</FormattedError>}
        {reflectionUnimplemented && request.protoFiles.length === 0 && (
          <Banner>
            <InlineCode>{request.url}</InlineCode> doesn&apos;t implement{' '}
            <Link href="https://github.com/grpc/grpc/blob/9aa3c5835a4ed6afae9455b63ed45c761d695bca/doc/server-reflection.md">
              Server Reflection
            </Link>{' '}
            . Please manually add the <InlineCode>.proto</InlineCode> files to get started.
          </Banner>
        )}
      </VStack>
    </VStack>
  );
}
