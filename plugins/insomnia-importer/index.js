import { importEnvironment } from './importers/environment.js';
import { importRequest } from './importers/request.js';
import { importWorkspace } from './importers/workspace.js';

const TYPES = {
  workspace: 'workspace',
  request: 'request',
  environment: 'environment',
};

export function pluginHookImport(contents) {
  const parsed = JSON.parse(contents);
  if (!isObject(parsed)) {
    return;
  }

  const { _type, __export_format } = parsed;
  if (_type !== 'export' || __export_format !== 4 || !Array.isArray(parsed.resources)) {
    return;
  }

  const resources = {
    workspaces: [],
    requests: [],
    environments: [],
  };

  for (const v of parsed.resources) {
    if (v._type === TYPES.workspace) {
      resources.workspaces.push(importWorkspace(v));
    } else if (v._type === TYPES.environment) {
      resources.environments.push(importEnvironment(v));
    } else if (v._type === TYPES.request) {
      resources.requests.push(importRequest(v));
    } else {
      console.log('UNKNOWN TYPE', v._type, JSON.stringify(v, null, 2));
    }
  }

  // Filter out any `null` values
  resources.requests = resources.requests.filter(Boolean);
  resources.environments = resources.environments.filter(Boolean);
  resources.workspaces = resources.workspaces.filter(Boolean);

  return resources;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
