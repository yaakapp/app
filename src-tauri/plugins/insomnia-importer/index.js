import { importRequest } from './importers/request.js';

const TYPE_REQUEST = 'request';

export function pluginHookImport(contents) {
  const parsed = JSON.parse(contents);
  if (!isObject(parsed)) {
    return;
  }

  const { _type, __export_format } = parsed;
  if (_type !== 'export' && __export_format !== 4) {
    return;
  }

  if (!Array.isArray(parsed.resources)) {
    return;
  }

  const importedResources = [];

  for (const r of parsed.resources) {
    if (r._type === TYPE_REQUEST) {
      importedResources.push(importRequest(r));
    }
  }

  console.log('CONTENTS', parsed._type, parsed.__export_format);

  return importedResources;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
