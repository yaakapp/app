export interface BaseModel {
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Workspace extends BaseModel {
  name: string;
  description: string;
}

export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpRequest extends BaseModel {
  name: string;
  url: string;
  body: string | null;
  method: string;
  headers: HttpHeader[];
}

export interface HttpResponse extends BaseModel {
  id: string;
  requestId: string;
  body: string;
  status: string;
  elapsed: number;
  statusReason: string;
  url: string;
  headers: HttpHeader[];
}

export function convertDates<T extends BaseModel>(m: T): T {
  return {
    ...m,
    createdAt: convertDate(m.createdAt),
    updatedAt: convertDate(m.updatedAt),
    deletedAt: m.deletedAt ? convertDate(m.deletedAt) : null,
  };
}

function convertDate(d: string | Date): Date {
  const date = new Date(d);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - userTimezoneOffset);
}
