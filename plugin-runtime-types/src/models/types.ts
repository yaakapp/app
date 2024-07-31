export interface BaseModel {
  readonly model: string;
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
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
