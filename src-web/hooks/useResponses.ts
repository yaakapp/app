import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { convertDates } from '../lib/models';

export function responsesQueryKey(requestId: string) {
  return ['responses', { requestId }];
}

export function useResponses(requestId: string) {
  return useQuery<HttpResponse[]>({
    initialData: [],
    queryKey: responsesQueryKey(requestId),
    queryFn: async () => {
      const responses = (await invoke('responses', { requestId })) as HttpResponse[];
      return responses.map(convertDates);
    },
  });
}

export function useDeleteResponse(response?: HttpResponse) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (response == null) return;
      await invoke('delete_response', { id: response.id });
    },
    onSuccess: () => {
      if (response == null) return;
      queryClient.setQueryData(
        ['responses', { requestId: response.requestId }],
        (responses: HttpResponse[] = []) => responses.filter((r) => r.id !== response.id),
      );
    },
  });
}

export function useDeleteAllResponses(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (requestId == null) return;
      await invoke('delete_all_responses', { requestId });
    },
    onSuccess: () => {
      if (requestId == null) return;
      queryClient.setQueryData(['responses', { requestId: requestId }], []);
    },
  });
}
