import { useQuery } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';

export function useFilterResponse({
  responseId,
  filter,
}: {
  responseId: string | null;
  filter: string;
}) {
  return useQuery<string | null, string>({
    queryKey: [responseId, filter],
    queryFn: async () => {
      if (filter === '') {
        return null;
      }

      return (await invokeCmd('cmd_filter_response', { responseId, filter })) as string | null;
    },
  });
}
