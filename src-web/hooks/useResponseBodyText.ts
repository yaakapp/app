import { useQuery } from '@tanstack/react-query';
import type { HttpResponse } from '../lib/models';
import { getResponseBodyText } from '../lib/responseBody';

export function useResponseBodyText(response: HttpResponse) {
  return useQuery<string | null>({
    queryKey: ['response-body-text', response?.updatedAt],
    initialData: null,
    queryFn: () => getResponseBodyText(response),
  }).data;
}
