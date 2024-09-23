import { useQuery } from '@tanstack/react-query';
import type { HttpRequest } from '@yaakapp-internal/models';
import type {
  CallHttpRequestActionRequest,
  GetHttpRequestActionsResponse,
} from '@yaakapp-internal/plugin';
import { invokeCmd } from '../lib/tauri';
import { usePluginsKey } from './usePlugins';

export function useHttpRequestActions() {
  const pluginsKey = usePluginsKey();

  const httpRequestActions = useQuery({
    queryKey: ['http_request_actions', pluginsKey],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const responses = (await invokeCmd(
        'cmd_http_request_actions',
      )) as GetHttpRequestActionsResponse[];
      return responses;
    },
  });

  return (
    httpRequestActions.data?.flatMap((r) =>
      r.actions.map((a) => ({
        key: a.key,
        label: a.label,
        icon: a.icon,
        call: async (httpRequest: HttpRequest) => {
          const payload: CallHttpRequestActionRequest = {
            key: a.key,
            pluginRefId: r.pluginRefId,
            args: { httpRequest },
          };
          await invokeCmd('cmd_call_http_request_action', { req: payload });
        },
      })),
    ) ?? []
  );
}
