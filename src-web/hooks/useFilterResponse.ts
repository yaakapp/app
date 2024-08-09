import { useQuery } from '@tanstack/react-query';
import type { JsonValue } from '@yaakapp/api/lib/gen/serde_json/JsonValue';
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

      const items = (await invokeCmd('cmd_filter_response', { responseId, filter })) as JsonValue[];
      return JSON.stringify(items, null, 2);
    },
  });
}
