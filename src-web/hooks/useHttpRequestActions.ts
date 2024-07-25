import { useQuery } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';

/** An opaque type (don't need to know what's inside) */
export type Callback = unknown;

export interface HttpRequestAction {
  key: string;
  label: string;
  onSelect: Callback;
}

export function useHttpRequestActions() {
  return useQuery<HttpRequestAction[]>({
    queryKey: ['http_request_actions'],
    queryFn: async () => (await invokeCmd('cmd_http_request_actions', {})) as HttpRequestAction[],
  });
}
