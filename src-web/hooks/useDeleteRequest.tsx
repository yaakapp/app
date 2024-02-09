import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { useDeleteAnyHttpRequest } from './useDeleteAnyHttpRequest';

export function useDeleteRequest(id: string | null) {
  const deleteAnyRequest = useDeleteAnyHttpRequest();

  return useMutation<HttpRequest | null, string>({
    mutationFn: () => deleteAnyRequest.mutateAsync(id ?? 'n/a'),
  });
}
