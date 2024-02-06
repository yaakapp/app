import { open } from '@tauri-apps/api/dialog';
import { useGrpcRequest } from '../hooks/useGrpcRequest';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { Button } from './core/Button';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export function GrpcProtoSelection({ requestId }: { requestId: string }) {
  const request = useGrpcRequest(requestId);
  const updateRequest = useUpdateGrpcRequest(request?.id ?? null);

  if (request == null) {
    return null;
  }

  return (
    <div>
      {request.protoFiles.length > 0 && (
        <table className="w-full divide-y mb-3">
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
                    onClick={() => {
                      updateRequest.mutate({
                        protoFiles: request.protoFiles.filter((p) => p !== f),
                      });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <HStack space={2} justifyContent="end">
        <Button
          color="gray"
          size="sm"
          onClick={async () => {
            updateRequest.mutate({ protoFiles: [] });
          }}
        >
          Clear Files
        </Button>
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
            updateRequest.mutate({ protoFiles: [...request.protoFiles, ...newFiles] });
          }}
        >
          Add Files
        </Button>
      </HStack>
    </div>
  );
}
