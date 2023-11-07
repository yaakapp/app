import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { useUpdateAnyRequest } from './useUpdateAnyRequest';

export function useUpdateRequest(id: string | null) {
  const updateAnyRequest = useUpdateAnyRequest();
  return useMutation<void, unknown, Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest)>({
    mutationFn: async (update) => updateAnyRequest.mutateAsync({ id: id ?? 'n/a', update }),
  });
}
