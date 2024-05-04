import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export function useFilterResponse({
  responseId,
  filter,
}: {
  responseId: string | null;
  filter: string;
}) {
  return (
    useQuery<string | null>({
      queryKey: [responseId, filter],
      queryFn: async () => {
        if (filter === '') {
          return null;
        }

        return (await invoke('cmd_filter_response', { responseId, filter })) as string | null;
      },
    }).data ?? null
  );
}
