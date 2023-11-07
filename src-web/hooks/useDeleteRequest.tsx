import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { useDeleteAnyRequest } from './useDeleteAnyRequest';

export function useDeleteRequest(id: string | null) {
  const deleteAnyRequest = useDeleteAnyRequest();

  return useMutation<HttpRequest | null, string>({
    mutationFn: () => deleteAnyRequest.mutateAsync(id ?? 'n/a'),
  });
}
