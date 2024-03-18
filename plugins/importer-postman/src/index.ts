import { Environment, Folder, HttpRequest, Workspace } from '../../../src-web/lib/models';

const POSTMAN_2_1_0_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
const POSTMAN_2_0_0_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json';
const VALID_SCHEMAS = [POSTMAN_2_0_0_SCHEMA, POSTMAN_2_1_0_SCHEMA];

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

interface ExportResources {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
}

export function pluginHookImport(contents: string): { resources: ExportResources } | undefined {
  const root = parseJSONToRecord(contents);
  if (root == null) return;

  const info = toRecord(root.info);
  const isValidSchema = VALID_SCHEMAS.includes(info.schema);
  if (!isValidSchema || !Array.isArray(root.item)) {
    return;
  }

  const exportResources: ExportResources = {
    workspaces: [],
    environments: [],
    httpRequests: [],
    folders: [],
  };

  const workspace: ExportResources['workspaces'][0] = {
    model: 'workspace',
    id: generateId('wk'),
    name: info.name || 'Postman Import',
    description: info.description || '',
  };
  exportResources.workspaces.push(workspace);

  const importItem = (v: Record<string, any>, folderId: string | null = null) => {
    if (typeof v.name === 'string' && Array.isArray(v.item)) {
      const folder: ExportResources['folders'][0] = {
        model: 'folder',
        workspaceId: workspace.id,
        id: generateId('fl'),
        name: v.name,
        folderId,
      };
      exportResources.folders.push(folder);
      for (const child of v.item) {
        importItem(child, folder.id);
      }
    } else if (typeof v.name === 'string' && 'request' in v) {
      const r = toRecord(v.request);
      const bodyPatch = importBody(r.body);
      const authPatch = importAuth(r.auth);
      const request: ExportResources['httpRequests'][0] = {
        model: 'http_request',
        id: generateId('rq'),
        workspaceId: workspace.id,
        folderId,
        name: v.name,
        method: r.method || 'GET',
        url: typeof r.url === 'string' ? r.url : toRecord(r.url).raw,
        body: bodyPatch.body,
        bodyType: bodyPatch.bodyType,
        authentication: authPatch.authentication,
        authenticationType: authPatch.authenticationType,
        headers: [
          ...bodyPatch.headers,
          ...authPatch.headers,
          ...toArray(r.header).map((h) => {
            return {
              name: h.key,
              value: h.value,
              enabled: !h.disabled,
            };
          }),
        ],
      };
      exportResources.httpRequests.push(request);
    } else {
      console.log('Unknown item', v, folderId);
    }
  };

  for (const item of root.item) {
    importItem(item);
  }

  return { resources: convertTemplateSyntax(exportResources) };
}

function importAuth(
  rawAuth: any,
): Pick<HttpRequest, 'authentication' | 'authenticationType' | 'headers'> {
  const auth = toRecord(rawAuth);
  if ('basic' in auth) {
    return {
      headers: [],
      authenticationType: 'basic',
      authentication: {
        username: auth.basic.username || '',
        password: auth.basic.password || '',
      },
    };
  } else {
    // TODO: support other auth types
    return { headers: [], authenticationType: null, authentication: {} };
  }
}

function importBody(rawBody: any): Pick<HttpRequest, 'body' | 'bodyType' | 'headers'> {
  const body = toRecord(rawBody);
  if ('graphql' in body) {
    return {
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json',
          enabled: true,
        },
      ],
      bodyType: 'graphql',
      body: {
        text: JSON.stringify(
          { query: body.graphql.query, variables: parseJSONToRecord(body.graphql.variables) },
          null,
          2,
        ),
      },
    };
  } else if ('urlencoded' in body) {
    return {
      headers: [
        {
          name: 'Content-Type',
          value: 'application/x-www-form-urlencoded',
          enabled: true,
        },
      ],
      bodyType: 'application/x-www-form-urlencoded',
      body: {
        form: toArray(body.urlencoded).map((f) => ({
          enabled: !f.disabled,
          name: f.key ?? '',
          value: f.value ?? '',
        })),
      },
    };
  } else if ('formdata' in body) {
    return {
      headers: [
        {
          name: 'Content-Type',
          value: 'multipart/form-data',
          enabled: true,
        },
      ],
      bodyType: 'multipart/form-data',
      body: {
        form: toArray(body.formdata).map((f) =>
          f.src != null
            ? {
                enabled: !f.disabled,
                name: f.key ?? '',
                file: f.src ?? '',
              }
            : {
                enabled: !f.disabled,
                name: f.key ?? '',
                value: f.value ?? '',
              },
        ),
      },
    };
  } else {
    // TODO: support other body types
    return { headers: [], bodyType: null, body: {} };
  }
}

function parseJSONToRecord(jsonStr: string): Record<string, any> | null {
  try {
    return toRecord(JSON.parse(jsonStr));
  } catch (err) {}
  return null;
}

function toRecord(value: any): Record<string, any> {
  if (Object.prototype.toString.call(value) === '[object Object]') return value;
  else return {};
}

function toArray(value: any): any[] {
  if (Object.prototype.toString.call(value) === '[object Array]') return value;
  else return [];
}

/** Recursively render all nested object properties */
function convertTemplateSyntax<T>(obj: T): T {
  if (typeof obj === 'string') {
    return obj.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}') as T;
  } else if (Array.isArray(obj) && obj != null) {
    return obj.map(convertTemplateSyntax) as T;
  } else if (typeof obj === 'object' && obj != null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertTemplateSyntax(v)]),
    ) as T;
  } else {
    return obj;
  }
}

export function generateId(prefix: 'wk' | 'rq' | 'fl'): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = `${prefix}_`;
  for (let i = 0; i < 10; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
