export interface BaseModel {
  readonly id: string;
  readonly workspaceId: string;
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
}

export interface HttpRequest extends BaseModel {
  readonly model: 'http_request';
  sortPriority: number;
  name: string;
  url: string;
  body: string | null;
  bodyType: string | null;
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

export function convertDates<T extends Pick<BaseModel, 'createdAt' | 'updatedAt'>>(m: T): T {
  return {
    ...m,
    createdAt: convertDate(m.createdAt),
    updatedAt: convertDate(m.updatedAt),
  };
}

function convertDate(d: string | Date): Date {
  if (typeof d !== 'string') {
    return d;
  }
  const date = new Date(d);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - userTimezoneOffset);
}
