import { useQuery } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { invokeCmd } from '../lib/tauri';

export type Callback = never;

export interface HttpRequestActionRaw {
  key: string;
  label: string;
  onSelect: Callback;
}

export interface HttpRequestAction {
  key: string;
  label: string;
  onSelect: (request: HttpRequest) => Promise<void>;
}

export function useHttpRequestActions() {
  return useQuery<HttpRequestAction[]>({
    queryKey: ['http_request_actions'],
    queryFn: async () => {
      const rawActions = (await invokeCmd(
        'cmd_http_request_actions',
        {},
      )) as HttpRequestActionRaw[];

      return rawActions.map((a) => ({
        ...a,
        onSelect: async (request) => {
          await invokeCmd('cmd_call_callback', {
            callback: a.onSelect,
            data: JSON.stringify(request),
          });
        },
      }));
    },
  });
}
