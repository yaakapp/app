import { getKeyValue, setKeyValue } from './keyValueStore';

export async function getLastLocation(): Promise<string> {
  return getKeyValue({ key: 'last_location', fallback: '/' });
}

export async function setLastLocation(pathname: string): Promise<void> {
  return setKeyValue({ key: 'last_location', value: pathname });
}

export async function syncLastLocation(): Promise<void> {
  const lastPathname = await getLastLocation();
  if (lastPathname !== window.location.pathname) {
    console.log(`Redirecting to last location: ${lastPathname}`);
    window.location.assign(lastPathname);
  }
}
