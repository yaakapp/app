import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { HttpRequest } from '../lib/models';
import { useRequests } from './useRequests';

export function useActiveRequest(): HttpRequest | null {
  const requests = useRequests();
  const { requestId } = useParams<{ requestId?: string }>();
  const [activeRequest, setActiveRequest] = useState<HttpRequest | null>(null);

  useEffect(() => {
    setActiveRequest(requests.find((r) => r.id === requestId) ?? null);
  }, [requests, requestId]);

  return activeRequest;
}
