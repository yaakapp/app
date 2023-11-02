import { importEnvironment } from './importers/environment.js';
import { importRequest } from './importers/request.js';
import { importWorkspace } from './importers/workspace.js';

const TYPES = {
  workspace: 'workspace',
  request: 'request',
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

  return parsed.resources
    .map((v) => {
      switch (v._type) {
        case TYPES.workspace:
          return importWorkspace(v);
        case TYPES.environment:
          return importEnvironment(v);
        case TYPES.request:
          return importRequest(v);
        default:
          return null;
      }
    })
    .filter(Boolean);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
