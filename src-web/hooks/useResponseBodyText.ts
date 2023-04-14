import { useQuery } from '@tanstack/react-query';
import { readTextFile } from '@tauri-apps/api/fs';
import type { HttpResponse } from '../lib/models';

export function useResponseBodyText(response: HttpResponse) {
  return useQuery<string | null>({
    queryKey: ['response-body-text', response?.updatedAt],
    initialData: null,
    queryFn: async () => {
      if (response.body) {
        const uint8Array = Uint8Array.of(...response.body);
        return new TextDecoder().decode(uint8Array);
      }

      if (response.bodyPath) {
        return await readTextFile(response.bodyPath);
      }

      return null;
    },
  }).data;
}
