import type {
  BaseModel,
  Workspace,
  HttpResponse,
  HttpRequest,
  HttpHeader,
  Folder,
  GrpcRequest,
  GrpcEvent,
  GrpcConnection,
  Environment,
} from '../../plugin-runtime-types';

export * from '../../plugin-runtime-types';

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

export type Model =
  | Settings
  | Workspace
  | Folder
  | GrpcConnection
  | GrpcRequest
  | GrpcEvent
  | HttpRequest
  | HttpResponse
  | KeyValue
  | Environment
  | CookieJar;

export interface Settings extends BaseModel {
  readonly model: 'settings';
  theme: string;
  appearance: string;
  themeLight: string;
  themeDark: string;
  updateChannel: string;
  interfaceFontSize: number;
  interfaceScale: number;
  editorFontSize: number;
  editorSoftWrap: boolean;
  openWorkspaceNewWindow: boolean | null;
}

export interface CookieJar extends BaseModel {
  readonly model: 'cookie_jar';
  workspaceId: string;
  name: string;
  cookies: Cookie[];
}

export interface Cookie {
  raw_cookie: string;
  domain: { HostOnly: string } | { Suffix: string } | 'NotPresent' | 'Empty';
  expires: { AtUtc: string } | 'SessionEnd';
  path: [string, boolean];
}

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

export interface KeyValue extends Omit<BaseModel, 'id'> {
  readonly model: 'key_value';
  readonly key: string;
  readonly namespace: string;
  value: string;
}

export function isResponseLoading(response: HttpResponse | GrpcConnection): boolean {
  return response.elapsed === 0;
}

export function modelsEq(a: Model, b: Model) {
  if (a.model === 'key_value' && b.model === 'key_value') {
    return a.key === b.key && a.namespace === b.namespace;
  }
  if ('id' in a && 'id' in b) {
    return a.id === b.id;
  }
  return false;
}

export function getContentTypeHeader(headers: HttpHeader[]): string | null {
  return headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? null;
}
