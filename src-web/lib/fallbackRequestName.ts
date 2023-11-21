import type { HttpRequest } from './models';

export function fallbackRequestName(r: HttpRequest | null): string {
  if (r == null) return '';

  if (r.name) {
    return r.name;
  }

  if (r.url.trim() === '') {
    return 'New Request';
  }

  const fixedUrl = r.url.match(/^https?:\/\//) ? r.url : 'http://' + r.url;

  try {
    const url = new URL(fixedUrl);
    const pathname = url.pathname === '/' ? '' : url.pathname;
    return `${url.host}${pathname}`;
  } catch (_) {
    // Nothing
  }

  return r.url;
}
