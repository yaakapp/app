import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { convertDates } from '../lib/models';

export function responsesQueryKey(requestId: string) {
  return ['http_responses', { requestId }];
}

export function useResponses(requestId: string | null) {
  return (
    useQuery<HttpResponse[]>({
      enabled: requestId !== null,
      initialData: [],
      queryKey: responsesQueryKey(requestId ?? 'n/a'),
      queryFn: async () => {
        const responses = (await invoke('responses', {
          requestId,
        })) as HttpResponse[];
        return responses.map(convertDates);
      },
    }).data ?? []
  );
}
