import { useMutation } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp/api';
import { useCopy } from './useCopy';
import { getResponseBodyText } from '../lib/responseBody';

export function useCopyHttpResponse(response: HttpResponse) {
  const copy = useCopy();
  return useMutation({
    mutationKey: ['copy_http_response'],
    async mutationFn() {
      const body = await getResponseBodyText(response);
      copy(body);
    },
  });
}
