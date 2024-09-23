import { useQuery } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp-internal/models';
import { getResponseBodyText } from '../lib/responseBody';

export function useResponseBodyText(response: HttpResponse) {
  return useQuery<string | null>({
    queryKey: ['response-body-text', response.id, response?.updatedAt],
    queryFn: () => getResponseBodyText(response),
  });
}
