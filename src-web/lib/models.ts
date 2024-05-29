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

export interface BaseModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

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
  editorSoftWrap: number;
}

export interface Workspace extends BaseModel {
  readonly model: 'workspace';
  name: string;
  description: string;
  variables: EnvironmentVariable[];
  settingValidateCertificates: boolean;
  settingFollowRedirects: boolean;
  settingRequestTimeout: number;
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

export interface EnvironmentVariable {
  name: string;
  value: string;
  enabled?: boolean;
}

export interface Folder extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'folder';
  folderId: string | null;
  sortPriority: number;
  name: string;
}

export interface Environment extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'environment';
  name: string;
  variables: EnvironmentVariable[];
}

export interface HttpHeader {
  name: string;
  value: string;
  enabled?: boolean;
}

export interface HttpUrlParameter {
  name: string;
  value: string;
  enabled?: boolean;
}

export interface GrpcMetadataEntry {
  name: string;
  value: string;
  enabled?: boolean;
}

export interface GrpcRequest extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'grpc_request';
  folderId: string | null;
  sortPriority: number;
  name: string;
  url: string;
  service: string | null;
  method: string | null;
  message: string;
  authentication: Record<string, string | number | boolean | null | undefined>;
  authenticationType: string | null;
  metadata: GrpcMetadataEntry[];
}

export interface GrpcEvent extends BaseModel {
  readonly workspaceId: string;
  readonly requestId: string;
  readonly connectionId: string;
  readonly model: 'grpc_event';
  content: string;
  status: number | null;
  error: string | null;
  eventType:
    | 'info'
    | 'error'
    | 'client_message'
    | 'server_message'
    | 'connection_start'
    | 'connection_end';
  metadata: Record<string, string>;
}

export interface GrpcConnection extends BaseModel {
  readonly workspaceId: string;
  readonly requestId: string;
  readonly model: 'grpc_connection';
  service: string;
  method: string;
  elapsed: number;
  elapsedConnection: number;
  status: number;
  url: string;
  error: string | null;
  trailers: Record<string, string>;
}

export interface HttpRequest extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'http_request';
  folderId: string | null;
  sortPriority: number;
  name: string;
  url: string;
  urlParameters: HttpUrlParameter[];
  body: Record<string, unknown>;
  bodyType: string | null;
  authentication: Record<string, string | number | boolean | null | undefined>;
  authenticationType: string | null;
  method: string;
  headers: HttpHeader[];
}

export interface KeyValue extends Omit<BaseModel, 'id'> {
  readonly model: 'key_value';
  readonly key: string;
  readonly namespace: string;
  value: string;
}

export interface HttpResponse extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'http_response';
  readonly requestId: string;
  readonly bodyPath: string | null;
  readonly contentLength: number | null;
  readonly error: string;
  readonly status: number;
  readonly elapsed: number;
  readonly elapsedHeaders: number;
  readonly statusReason: string;
  readonly version: string;
  readonly remoteAddr: string;
  readonly url: string;
  readonly headers: HttpHeader[];
}

export function isResponseLoading(response: HttpResponse): boolean {
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
