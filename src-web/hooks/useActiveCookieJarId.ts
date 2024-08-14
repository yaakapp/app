import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const QUERY_COOKIE_JAR_ID = 'cookie_jar_id';

export function useActiveCookieJarId() {
  // NOTE: This query param is accessed from Rust side, so do not change
  const [params, setParams] = useSearchParams();
  const id = params.get(QUERY_COOKIE_JAR_ID);

  const setId = useCallback(
    (id: string) => {
      setParams((p) => {
        const existing = Object.fromEntries(p);
        return { ...existing, [QUERY_COOKIE_JAR_ID]: id };
      });
    },
    [setParams],
  );

  return [id, setId] as const;
}
