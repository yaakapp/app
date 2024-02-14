import { useSearchParams } from 'react-router-dom';

export const QUERY_ENVIRONMENT_ID = 'environment_id';

export function useActiveEnvironmentId(): string | null {
  const [params] = useSearchParams();
  const environmentId = params.get(QUERY_ENVIRONMENT_ID);
  if (environmentId == null) {
    return null;
  }

  return environmentId;
}
