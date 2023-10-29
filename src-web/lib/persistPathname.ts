import { appWindow } from '@tauri-apps/api/window';
import { NAMESPACE_NO_SYNC, getKeyValue, setKeyValue } from './keyValueStore';

const key = ['window_pathname', appWindow.label];
const namespace = NAMESPACE_NO_SYNC;
const fallback = undefined;

export async function setPathname(value: string) {
  await setKeyValue<string | undefined>({ key, namespace, value });
}

export async function maybeRestorePathname() {
  if (window.location.pathname !== '/') {
    return;
  }

  const pathname = await getKeyValue<string | undefined>({ key, namespace, fallback });
  if (pathname != null) {
    window.location.replace(pathname);
  }
}
