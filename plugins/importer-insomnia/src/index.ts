import {
  Environment,
  Folder,
  GrpcRequest,
  HttpRequest,
  Workspace,
} from '../../../src-web/lib/models';
import YAML from 'yaml';

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface ExportResources {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  grpcRequests: AtLeast<GrpcRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
}

export function pluginHookImport(ctx: any, contents: string) {
  let parsed: any;

  try {
    parsed = JSON.parse(contents);
  } catch (e) {}

  try {
    parsed = parsed ?? YAML.parse(contents);
  } catch (e) {
    console.log('FAILED', e);
  }

  if (!isJSObject(parsed)) return;
  if (!Array.isArray(parsed.resources)) return;

  const resources: ExportResources = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: [],
  };

  // Import workspaces
  const workspacesToImport = parsed.resources.filter(isWorkspace);
  for (const workspaceToImport of workspacesToImport) {
    const baseEnvironment = parsed.resources.find(
      (r: any) => isEnvironment(r) && r.parentId === workspaceToImport._id,
    );
    resources.workspaces.push({
      id: convertId(workspaceToImport._id),
      createdAt: new Date(workspacesToImport.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(workspacesToImport.updated ?? Date.now()).toISOString().replace('Z', ''),
      model: 'workspace',
      name: workspaceToImport.name,
      variables: baseEnvironment ? parseVariables(baseEnvironment.data) : [],
    });
    const environmentsToImport = parsed.resources.filter(
      (r: any) => isEnvironment(r) && r.parentId === baseEnvironment?._id,
    );
    resources.environments.push(
      ...environmentsToImport.map((r: any) => importEnvironment(r, workspaceToImport._id)),
    );

    const nextFolder = (parentId: string) => {
      const children = parsed.resources.filter((r: any) => r.parentId === parentId);
      let sortPriority = 0;
      for (const child of children) {
        if (isRequestGroup(child)) {
          resources.folders.push(importFolder(child, workspaceToImport._id));
          nextFolder(child._id);
        } else if (isHttpRequest(child)) {
          resources.httpRequests.push(
            importHttpRequest(child, workspaceToImport._id, sortPriority++),
          );
        } else if (isGrpcRequest(child)) {
          resources.grpcRequests.push(
            importGrpcRequest(child, workspaceToImport._id, sortPriority++),
          );
        }
      }
    };

    // Import folders
    nextFolder(workspaceToImport._id);
  }

  // Filter out any `null` values
  resources.httpRequests = resources.httpRequests.filter(Boolean);
  resources.grpcRequests = resources.grpcRequests.filter(Boolean);
  resources.environments = resources.environments.filter(Boolean);
  resources.workspaces = resources.workspaces.filter(Boolean);

  return { resources };
}

function importEnvironment(e: any, workspaceId: string): ExportResources['environments'][0] {
  return {
    id: convertId(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId: convertId(workspaceId),
    model: 'environment',
    name: e.name,
    variables: Object.entries(e.data).map(([name, value]) => ({
      enabled: true,
      name,
      value: `${value}`,
    })),
  };
}

function importFolder(f: any, workspaceId: string): ExportResources['folders'][0] {
  return {
    id: convertId(f._id),
    createdAt: new Date(f.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(f.updated ?? Date.now()).toISOString().replace('Z', ''),
    folderId: f.parentId === workspaceId ? null : convertId(f.parentId),
    workspaceId: convertId(workspaceId),
    model: 'folder',
    name: f.name,
  };
}

function importGrpcRequest(
  r: any,
  workspaceId: string,
  sortPriority = 0,
): ExportResources['grpcRequests'][0] {
  const parts = r.protoMethodName.split('/').filter((p: any) => p !== '');
  const service = parts[0] ?? null;
  const method = parts[1] ?? null;

  return {
    id: convertId(r._id),
    createdAt: new Date(r.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(r.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId: convertId(workspaceId),
    folderId: r.parentId === workspaceId ? null : convertId(r.parentId),
    model: 'grpc_request',
    sortPriority,
    name: r.name,
    url: convertSyntax(r.url),
    service,
    method,
    message: r.body?.text ?? '',
    metadata: (r.metadata ?? [])
      .map((h: any) => ({
        enabled: !h.disabled,
        name: h.name ?? '',
        value: h.value ?? '',
      }))
      .filter(({ name, value }: any) => name !== '' || value !== ''),
  };
}

function importHttpRequest(
  r: any,
  workspaceId: string,
  sortPriority = 0,
): ExportResources['httpRequests'][0] {
  let bodyType = null;
  let body = {};
  if (r.body.mimeType === 'application/octet-stream') {
    bodyType = 'binary';
    body = { filePath: r.body.fileName ?? '' };
  } else if (r.body?.mimeType === 'application/x-www-form-urlencoded') {
    bodyType = 'application/x-www-form-urlencoded';
    body = {
      form: (r.body.params ?? []).map((p: any) => ({
        enabled: !p.disabled,
        name: p.name ?? '',
        value: p.value ?? '',
      })),
    };
  } else if (r.body?.mimeType === 'multipart/form-data') {
    bodyType = 'multipart/form-data';
    body = {
      form: (r.body.params ?? []).map((p: any) => ({
        enabled: !p.disabled,
        name: p.name ?? '',
        value: p.value ?? '',
        file: p.fileName ?? null,
      })),
    };
  } else if (r.body?.mimeType === 'application/graphql') {
    bodyType = 'graphql';
    body = { text: convertSyntax(r.body.text ?? '') };
  } else if (r.body?.mimeType === 'application/json') {
    bodyType = 'application/json';
    body = { text: convertSyntax(r.body.text ?? '') };
  }

  let authenticationType = null;
  let authentication = {};
  if (r.authentication.type === 'bearer') {
    authenticationType = 'bearer';
    authentication = {
      token: convertSyntax(r.authentication.token),
    };
  } else if (r.authentication.type === 'basic') {
    authenticationType = 'basic';
    authentication = {
      username: convertSyntax(r.authentication.username),
      password: convertSyntax(r.authentication.password),
    };
  }

  return {
    id: convertId(r._id),
    createdAt: new Date(r.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(r.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId: convertId(workspaceId),
    folderId: r.parentId === workspaceId ? null : convertId(r.parentId),
    model: 'http_request',
    sortPriority,
    name: r.name,
    url: convertSyntax(r.url),
    body,
    bodyType,
    authentication,
    authenticationType,
    method: r.method,
    headers: (r.headers ?? [])
      .map((h: any) => ({
        enabled: !h.disabled,
        name: h.name ?? '',
        value: h.value ?? '',
      }))
      .filter(({ name, value }: any) => name !== '' || value !== ''),
  };
}

function parseVariables(data: Record<string, string>) {
  return Object.entries(data).map(([name, value]) => ({
    enabled: true,
    name,
    value: `${value}`,
  }));
}

function convertSyntax(variable: string): string {
  if (!isJSString(variable)) return variable;
  return variable.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}');
}

function isWorkspace(obj: any) {
  return isJSObject(obj) && obj._type === 'workspace';
}

function isRequestGroup(obj: any) {
  return isJSObject(obj) && obj._type === 'request_group';
}

function isHttpRequest(obj: any) {
  return isJSObject(obj) && obj._type === 'request';
}

function isGrpcRequest(obj: any) {
  return isJSObject(obj) && obj._type === 'grpc_request';
}

function isEnvironment(obj: any) {
  return isJSObject(obj) && obj._type === 'environment';
}

function isJSObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isJSString(obj: any) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function convertId(id: string): string {
  if (id.startsWith('GENERATE_ID::')) {
    return id;
  }
  return `GENERATE_ID::${id}`;
}
