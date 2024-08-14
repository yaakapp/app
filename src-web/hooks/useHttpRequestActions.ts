import { useQuery } from '@tanstack/react-query';
import type {
  CallHttpRequestActionRequest,
  GetHttpRequestActionsResponse,
  HttpRequest,
} from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';

export function useHttpRequestActions() {
  const httpRequestActions = useQuery({
    queryKey: ['http_request_actions'],
    queryFn: async () => {
      const responses = (await invokeCmd(
        'cmd_http_request_actions',
      )) as GetHttpRequestActionsResponse[];
      return responses;
    },
  });

  console.log('HELLO', httpRequestActions.data);

  return (
    httpRequestActions.data?.flatMap((r) =>
      r.actions.map((a) => ({
        key: a.key,
        label: a.label,
        call: async (httpRequest: HttpRequest) => {
          const payload: CallHttpRequestActionRequest = {
            key: a.key,
            pluginRefId: r.pluginRefId,
            args: {
              httpRequest,
            },
          };
          await invokeCmd('cmd_call_http_request_action', { req: payload });
        },
      })),
    ) ?? []
  );
}
