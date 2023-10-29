import { appWindow } from '@tauri-apps/api/window';
import { NAMESPACE_NO_SYNC, getKeyValue, setKeyValue } from './keyValueStore';

const key = ['window_pathname', appWindow.label];
const namespace = NAMESPACE_NO_SYNC;
const fallback = undefined;

export async function initPathnamePersistance() {
  if (window.location.pathname === '/') {
    const pathname = await getKeyValue<string | undefined>({ key, namespace, fallback });
    if (pathname != null) {
      window.location.replace(pathname);
    }
    return;
  }

  window.addEventListener('pushstate', async () => {
    const { pathname: value } = window.location;
    await setKeyValue<string | undefined>({ key, namespace, value });
  });
}
