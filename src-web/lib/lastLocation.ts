import { getKeyValue, NAMESPACE_NO_SYNC, setKeyValue } from './keyValueStore';

export async function getLastLocation(): Promise<string> {
  return getKeyValue({ namespace: NAMESPACE_NO_SYNC, key: 'last_location', fallback: '/' });
}

export async function setLastLocation(pathname: string): Promise<void> {
  return setKeyValue({ namespace: NAMESPACE_NO_SYNC, key: 'last_location', value: pathname });
}

export async function syncLastLocation(): Promise<void> {
  const lastPathname = await getLastLocation();
  if (lastPathname !== window.location.pathname) {
    console.log(`Redirecting to last location: ${lastPathname}`);
    window.location.assign(lastPathname);
  }
}
