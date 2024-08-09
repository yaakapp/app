import { useQuery } from '@tanstack/react-query';
import type { FilterResponse } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';

export function useFilterResponse({
  responseId,
  filter,
}: {
  responseId: string | null;
  filter: string;
}) {
  return useQuery<string | null, string>({
    queryKey: ['filter_response', responseId, filter],
    queryFn: async () => {
      if (filter === '') {
        return null;
      }

      const result = (await invokeCmd('cmd_filter_response', {
        responseId,
        filter,
      })) as FilterResponse;

      return result.content;
    },
  });
}
