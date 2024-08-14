import { useEffect, useMemo } from 'react';
import { getKeyValue } from '../lib/keyValueStore';
import { useActiveCookieJar } from './useActiveCookieJar';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useCookieJars } from './useCookieJars';
import { useKeyValue } from './useKeyValue';

const kvKey = (workspaceId: string) => 'recent_cookie_jars::' + workspaceId;
const namespace = 'global';
const fallback: string[] = [];

export function useRecentCookieJars() {
  const cookieJars = useCookieJars();
  const activeWorkspace = useActiveWorkspace();
  const [activeCookieJar] = useActiveCookieJar();
  const activeCookieJarId = activeCookieJar?.id ?? null;
  const kv = useKeyValue<string[]>({
    key: kvKey(activeWorkspace?.id ?? 'n/a'),
    namespace,
    fallback,
  });

  // Set history when active request changes
  useEffect(() => {
    kv.set((currentHistory: string[]) => {
      if (activeCookieJarId === null) return currentHistory;
      const withoutCurrent = currentHistory.filter((id) => id !== activeCookieJarId);
      return [activeCookieJarId, ...withoutCurrent];
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCookieJarId]);

  const onlyValidIds = useMemo(
    () => kv.value?.filter((id) => cookieJars.data?.some((e) => e.id === id)) ?? [],
    [kv.value, cookieJars],
  );

  return onlyValidIds;
}

export async function getRecentCookieJars(workspaceId: string) {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(workspaceId),
    fallback,
  });
}
