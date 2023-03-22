export interface BaseModel {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
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

export enum HttpRequestBodyType {
  GraphQL = 'graphql',
  JSON = 'application/json',
  XML = 'text/xml',
}

export interface HttpRequest extends BaseModel {
  readonly workspaceId: string;
  readonly model: 'http_request';
  sortPriority: number;
  name: string;
  url: string;
  body: string | null;
  bodyType: HttpRequestBodyType | null;
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
  readonly body: string;
  readonly error: string;
  readonly status: number;
  readonly elapsed: number;
  readonly statusReason: string;
  readonly url: string;
  readonly headers: HttpHeader[];
}
