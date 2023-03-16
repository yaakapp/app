import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { convertDates } from '../lib/models';
import { useActiveRequest } from './useActiveRequest';

export function responsesQueryKey(requestId: string) {
  return ['http_responses', { requestId }];
}

export function useResponses() {
  const activeRequest = useActiveRequest();
  return (
    useQuery<HttpResponse[]>({
      enabled: activeRequest != null,
      initialData: [],
      queryKey: responsesQueryKey(activeRequest?.id ?? 'n/a'),
      queryFn: async () => {
        const responses = (await invoke('responses', {
          requestId: activeRequest?.id,
        })) as HttpResponse[];
        return responses.map(convertDates);
      },
    }).data ?? []
  );
}
