import type {
  AnyModel,
  Cookie,
  GrpcConnection,
  HttpResponse,
  HttpResponseHeader,
} from '@yaakapp-internal/models';

export const BODY_TYPE_NONE = null;
export const BODY_TYPE_GRAPHQL = 'graphql';
export const BODY_TYPE_JSON = 'application/json';
export const BODY_TYPE_BINARY = 'binary';
export const BODY_TYPE_OTHER = 'other';
export const BODY_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
export const BODY_TYPE_FORM_MULTIPART = 'multipart/form-data';
export const BODY_TYPE_XML = 'text/xml';

export const AUTH_TYPE_NONE = null;
export const AUTH_TYPE_BASIC = 'basic';
export const AUTH_TYPE_BEARER = 'bearer';

export function cookieDomain(cookie: Cookie): string {
  if (cookie.domain === 'NotPresent' || cookie.domain === 'Empty') {
    return 'n/a';
  }
  if ('HostOnly' in cookie.domain) {
    return cookie.domain.HostOnly;
  }
  if ('Suffix' in cookie.domain) {
    return cookie.domain.Suffix;
  }
  return 'unknown';
}

export function isResponseLoading(response: HttpResponse | GrpcConnection): boolean {
  return response.elapsed === 0;
}

export function modelsEq(a: AnyModel, b: AnyModel) {
  if (a.model != b.model) {
    return false;
  }
  if (a.model === 'key_value' && b.model === 'key_value') {
    return a.key === b.key && a.namespace === b.namespace;
  }
  if ('id' in a && 'id' in b) {
    return a.id === b.id;
  }
  return false;
}

export function getContentTypeHeader(headers: HttpResponseHeader[]): string | null {
  return headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? null;
}

export function getCharsetFromContentType(headers: HttpResponseHeader[]): string | null {
  const contentType = getContentTypeHeader(headers);
  return contentType?.match(/charset=([^ ;]+)/)?.[1] ?? null;
}