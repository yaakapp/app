import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { convertDates, HttpRequest } from '../lib/models';
import { responsesQueryKey } from './useResponses';

export function useRequests(workspaceId: string) {
  return useQuery(['requests'], async () => {
    const requests = (await invoke('requests', { workspaceId })) as HttpRequest[];
    return requests.map(convertDates);
  });
}

export function useRequestUpdate(request: HttpRequest | null) {
  const queryClient = useQueryClient();
  return useMutation<HttpRequest, unknown, Partial<HttpRequest>>({
    mutationFn: async (patch) => {
      if (request == null) {
        throw new Error("Can't update a null request");
      }
      // console.error('UPDATE REQUEST', patch);
      const req = await invoke('upsert_request', { ...request, ...patch });
      return convertDates(req as HttpRequest);
    },
    onSuccess: (req) => {
      queryClient.setQueryData(['requests'], (requests: HttpRequest[] = []) =>
        requests.map((r) => (r.id === req.id ? req : r)),
      );
    },
  });
}

export function useRequestCreate(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<HttpRequest, unknown, Partial<Omit<HttpRequest, 'workspaceId'>>>({
    mutationFn: async (patch) => {
      const req = await invoke('upsert_request', {
        url: '',
        method: 'GET',
        name: 'New Request',
        headers: [],
        ...patch,
        workspaceId,
      });
      return convertDates(req as HttpRequest);
    },
    onSuccess: (req) => {
      queryClient.setQueryData(['requests'], (requests: HttpRequest[] = []) => [...requests, req]);
    },
  });
}

export function useSendRequest(request: HttpRequest | null) {
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (request == null) return;
      await invoke('send_request', { requestId: request.id });
    },
    onSuccess: async () => {
      if (request == null) return;
      await queryClient.invalidateQueries(responsesQueryKey(request.id));
    },
  });
}
