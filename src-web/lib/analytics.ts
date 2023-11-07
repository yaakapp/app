import { getVersion } from '@tauri-apps/api/app';
import type { Environment, Folder, HttpRequest, HttpResponse, KeyValue, Workspace } from './models';

const appVersion = await getVersion();

export function trackEvent(
  resource:
    | Workspace['model']
    | Environment['model']
    | Folder['model']
    | HttpRequest['model']
    | HttpResponse['model']
    | KeyValue['model'],
  event: 'create' | 'update' | 'delete' | 'delete_many' | 'send' | 'duplicate',
  attributes: Record<string, string | number> = {},
) {
  send('/e', [
    { name: 'e', value: `${resource}.${event}` },
    { name: 'a', value: JSON.stringify({ ...attributes, version: appVersion }) },
  ]);
}

export function trackPage(pathname: string) {
  if (pathname === sessionStorage.lastPathName) {
    return;
  }

  sessionStorage.lastPathName = pathname;
  send('/p', [
    {
      name: 'h',
      value: 'desktop.yaak.app',
    },
    { name: 'p', value: pathname },
  ]);
}

function send(path: string, params: { name: string; value: string | number }[]) {
  if (localStorage.disableAnalytics === 'true') {
    console.log('Analytics disabled', path, params);
  }

  params.push({ name: 'id', value: 'site_zOK0d7jeBy2TLxFCnZ' });
  params.push({
    name: 'tz',
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  params.push({ name: 'xy', value: screensize() });
  const qs = params.map((v) => `${v.name}=${encodeURIComponent(v.value)}`).join('&');
  const url = `https://t.yaak.app/t${path}?${qs}`;
  fetch(url, { mode: 'no-cors' }).catch((err) => console.log('Error:', err));
}

function screensize() {
  const w = window.screen.width;
  const h = window.screen.height;
  return `${Math.round(w / 100) * 100}x${Math.round(h / 100) * 100}`;
}
