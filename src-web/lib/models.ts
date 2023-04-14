export interface BaseModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Workspace extends BaseModel {
  readonly model: 'workspace';
  name: string;
  description: string;
}

export interface HttpHeader {
  name: string;
  value: string;
  enabled?: boolean;
}

export const BODY_TYPE_NONE = null;
export const BODY_TYPE_GRAPHQL = 'graphql';
export const BODY_TYPE_JSON = 'application/json';
export const BODY_TYPE_XML = 'text/xml';

export const AUTH_TYPE_NONE = null;
export const AUTH_TYPE_BASIC = 'basic';
export const AUTH_TYPE_BEARER = 'bearer';

export type Model = Workspace | HttpRequest | HttpResponse | KeyValue;

export function modelsEq(a: Model, b: Model) {
  if (a.model === 'key_value' && b.model === 'key_value') {
    return a.key === b.key && a.namespace === b.namespace;
  }
  if ('id' in a && 'id' in b) {
    return a.id === b.id;
  }
  return false;
}

export interface HttpRequest extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'http_request';
  sortPriority: number;
  name: string;
  url: string;
  body: string | null;
  bodyType: string | null;
  authentication: Record<string, string | number | boolean | null | undefined>;
  authenticationType: string | null;
  auth: Record<string, string | number | null>;
  authType: string | null;
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
  readonly body: number[] | null;
  readonly bodyPath: string | null;
  readonly contentLength: number | null;
  readonly error: string;
  readonly status: number;
  readonly elapsed: number;
  readonly statusReason: string;
  readonly url: string;
  readonly headers: HttpHeader[];
}

export function isResponseLoading(response: HttpResponse): boolean {
  return !(response.body || response.status || response.error);
}
