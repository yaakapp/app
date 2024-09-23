import { useQuery } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp-internal/models';
import { invokeCmd } from '../lib/tauri';

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
        if (requestId == null) return [];
        return (await invokeCmd('cmd_list_http_responses', {
          requestId,
          limit: 200,
        })) as HttpResponse[];
      },
    }).data ?? []
  );
}
