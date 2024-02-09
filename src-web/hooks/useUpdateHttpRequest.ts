import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';

export function useUpdateHttpRequest(id: string | null) {
  const updateAnyRequest = useUpdateAnyHttpRequest();
  return useMutation<void, unknown, Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest)>({
    mutationFn: async (update) => updateAnyRequest.mutateAsync({ id: id ?? 'n/a', update }),
  });
}
