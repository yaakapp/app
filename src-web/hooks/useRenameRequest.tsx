import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest, HttpRequest } from '@yaakapp/api';
import { InlineCode } from '../components/core/InlineCode';
import { usePrompt } from './usePrompt';
import { useRequests } from './useRequests';
import { useUpdateAnyGrpcRequest } from './useUpdateAnyGrpcRequest';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';

export function useRenameRequest(requestId: string | null) {
  const prompt = usePrompt();
  const updateHttpRequest = useUpdateAnyHttpRequest();
  const updateGrpcRequest = useUpdateAnyGrpcRequest();
  const requests = useRequests();

  return useMutation({
    mutationFn: async () => {
      const request = requests.find((r) => r.id === requestId);
      if (request == null) return;

      const name = await prompt({
        id: 'rename-request',
        title: 'Rename Request',
        description:
          request.name === '' ? (
            'Enter a new name'
          ) : (
            <>
              Enter a new name for <InlineCode>{request.name}</InlineCode>
            </>
          ),
        name: 'name',
        label: 'Name',
        placeholder: 'New Name',
        defaultValue: request.name,
      });
      if (request.model === 'http_request') {
        updateHttpRequest.mutate({ id: request.id, update: (r: HttpRequest) => ({ ...r, name }) });
      } else {
        updateGrpcRequest.mutate({ id: request.id, update: (r: GrpcRequest) => ({ ...r, name }) });
      }
    },
  });
}