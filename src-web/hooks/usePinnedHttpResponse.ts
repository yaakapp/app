import type { HttpRequest, HttpResponse } from '@yaakapp/api';
import { useHttpResponses } from './useHttpResponses';
import { useKeyValue } from './useKeyValue';
import { useLatestHttpResponse } from './useLatestHttpResponse';

export function usePinnedHttpResponse(activeRequest: HttpRequest) {
  const latestResponse = useLatestHttpResponse(activeRequest.id);
  const { set, value: pinnedResponseId } = useKeyValue<string | null>({
    // Key on latest response instead of activeRequest because responses change out of band of active request
    key: ['pinned_http_response_id', latestResponse?.id ?? 'n/a'],
    fallback: null,
    namespace: 'global',
  });
  const responses = useHttpResponses(activeRequest.id);
  const activeResponse: HttpResponse | null =
    responses.find((r) => r.id === pinnedResponseId) ?? latestResponse;

  const setPinnedResponseId = async (id: string) => {
    if (pinnedResponseId === id) {
      await set(null);
    } else {
      await set(id);
    }
  };

  return { activeResponse, setPinnedResponseId, pinnedResponseId, responses } as const;
}
