import { useCallback, useEffect } from 'react';
import { createGlobalState } from 'react-use';
import type { HttpRequest, HttpResponse } from '../lib/models';
import { useHttpResponses } from './useHttpResponses';
import { useLatestHttpResponse } from './useLatestHttpResponse';

const usePinnedResponseIdState = createGlobalState<string | null>(null);

export function usePinnedHttpResponse(activeRequest: HttpRequest) {
  const [pinnedResponseId, setPinnedResponseId] = usePinnedResponseIdState();
  const latestResponse = useLatestHttpResponse(activeRequest.id);
  const responses = useHttpResponses(activeRequest.id);
  const activeResponse: HttpResponse | null = pinnedResponseId
    ? responses.find((r) => r.id === pinnedResponseId) ?? null
    : latestResponse ?? null;

  // Unset pinned response when a new one comes in
  useEffect(() => setPinnedResponseId(null), [responses.length, setPinnedResponseId]);

  const setPinnedResponse = useCallback(
    (r: HttpResponse) => {
      setPinnedResponseId(r.id);
    },
    [setPinnedResponseId],
  );

  return { activeResponse, setPinnedResponse, pinnedResponseId, responses } as const;
}
