import { useEffect, useMemo } from 'react';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useCookieJars } from './useCookieJars';
import { useKeyValue } from './useKeyValue';

export function useActiveCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const cookieJars = useCookieJars();

  const {
    set: setActiveCookieJarId,
    value: activeCookieJarId,
    isLoading: isLoadingActiveCookieJarId,
  } = useKeyValue<string | null>({
    namespace: 'global',
    key: ['activeCookieJar', workspaceId ?? 'n/a'],
    fallback: null,
  });

  const activeCookieJar = useMemo(
    () => cookieJars.find((cookieJar) => cookieJar.id === activeCookieJarId),
    [activeCookieJarId, cookieJars],
  );

  // TODO: Make this not be called so many times (move to GlobalHooks?)
  useEffect(() => {
    if (!isLoadingActiveCookieJarId && activeCookieJar == null && cookieJars.length > 0) {
      setActiveCookieJarId(cookieJars[0]?.id ?? null).catch(console.error);
    }
  }, [activeCookieJar, cookieJars, isLoadingActiveCookieJarId, setActiveCookieJarId]);

  return {
    activeCookieJar: activeCookieJar ?? null,
    setActiveCookieJarId: setActiveCookieJarId,
  };
}
