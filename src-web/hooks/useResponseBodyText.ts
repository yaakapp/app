import { useQuery } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp/api';
import { getResponseBodyText } from '../lib/responseBody';

export function useResponseBodyText(response: HttpResponse) {
  return useQuery<string | null>({
    queryKey: ['response-body-text', response?.updatedAt],
    queryFn: () => getResponseBodyText(response),
  });
}
