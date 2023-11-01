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
    .map((r) => {
      switch (r._type) {
        case TYPES.workspace:
          return importWorkspace(r);
        case TYPES.request:
          return importRequest(r);
        default:
          return null;
      }
    })
    .filter(Boolean);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
