import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { HttpResponse } from '../lib/models';

export function httpResponsesQueryKey({ requestId }: { requestId: string }) {
  return ['http_responses', { requestId }];
}

export function useHttpResponses(requestId: string | null) {
  return (
    useQuery<HttpResponse[]>({
      enabled: requestId !== null,
      initialData: [],
      queryKey: httpResponsesQueryKey({ requestId: requestId ?? 'n/a' }),
      queryFn: async () => {
        return (await invoke('cmd_list_http_responses', {
          requestId,
          limit: 200,
        })) as HttpResponse[];
      },
    }).data ?? []
  );
}
