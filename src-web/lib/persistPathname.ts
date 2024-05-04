import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { getKeyValue, setKeyValue } from './keyValueStore';

const key = ['window_pathname', getCurrent().label];
const namespace = 'no_sync';
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
