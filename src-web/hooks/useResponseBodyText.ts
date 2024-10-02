import { useQuery } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp-internal/models';
import { getResponseBodyText } from '../lib/responseBody';

export function useResponseBodyText(response: HttpResponse) {
  return useQuery<string | null>({
    placeholderData: (prev) => prev,
    queryKey: ['response-body-text', response.id, response.updatedAt, response.elapsed],
    queryFn: () => {
      return getResponseBodyText(response);
    },
  });
}
