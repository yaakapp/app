import { useEffect } from 'react';
import { useActiveCookieJarId } from './useActiveCookieJarId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useKeyValue } from './useKeyValue';

export function useMigrateActiveCookieJarId() {
  const workspaceId = useActiveWorkspaceId();
  const [, setActiveCookieJarId] = useActiveCookieJarId();
  const {
    set: setLegacyActiveCookieJarId,
    value: legacyActiveCookieJarId,
    isLoading: isLoadingLegacyActiveCookieJarId,
  } = useKeyValue<string | null>({
    namespace: 'global',
    key: ['activeCookieJar', workspaceId ?? 'n/a'],
    fallback: null,
  });

  useEffect(() => {
    if (legacyActiveCookieJarId == null || isLoadingLegacyActiveCookieJarId) return;

    console.log('Migrating active cookie jar ID to query param', legacyActiveCookieJarId);
    setActiveCookieJarId(legacyActiveCookieJarId);
    setLegacyActiveCookieJarId(null).catch(console.error);
  }, [
    workspaceId,
    isLoadingLegacyActiveCookieJarId,
    legacyActiveCookieJarId,
    setActiveCookieJarId,
    setLegacyActiveCookieJarId,
  ]);
}
