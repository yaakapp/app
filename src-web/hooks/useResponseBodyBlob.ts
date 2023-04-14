import { useQuery } from '@tanstack/react-query';
import { readBinaryFile } from '@tauri-apps/api/fs';
import type { HttpResponse } from '../lib/models';

export function useResponseBodyBlob(response: HttpResponse | null) {
  return useQuery<Uint8Array | null>({
    enabled: response != null,
    queryKey: ['response-body-binary', response?.updatedAt],
    initialData: null,
    queryFn: async () => {
      if (response?.body) {
        return Uint8Array.of(...response.body);
      }
      if (response?.bodyPath) {
        return readBinaryFile(response.bodyPath);
      }
      return null;
    },
  }).data;
}
