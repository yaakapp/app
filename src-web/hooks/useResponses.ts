import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';

export function responsesQueryKey({ requestId }: { requestId: string }) {
  return ['http_responses', { requestId }];
}

export function useResponses(requestId: string | null) {
  return (
    useQuery<HttpResponse[]>({
      enabled: requestId !== null,
      initialData: [],
      queryKey: responsesQueryKey({ requestId: requestId ?? 'n/a' }),
      queryFn: async () => {
        return (await invoke('list_responses', { requestId, limit: 200 })) as HttpResponse[];
      },
    }).data ?? []
  );
}
