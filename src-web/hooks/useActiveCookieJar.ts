import { NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useCookieJars } from './useCookieJars';
import { useKeyValue } from './useKeyValue';

export function useActiveCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const cookieJars = useCookieJars();

  const kv = useKeyValue<string | null>({
    namespace: NAMESPACE_GLOBAL,
    key: ['activeCookieJar', workspaceId ?? 'n/a'],
    defaultValue: null,
  });

  const activeCookieJar = cookieJars.find((cookieJar) => cookieJar.id === kv.value);

  return {
    activeCookieJar: activeCookieJar ?? null,
    setActiveCookieJarId: kv.set,
  };
}
