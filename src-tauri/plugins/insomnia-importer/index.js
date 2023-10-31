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

  const resources = parsed.resources || [];
  for (const r of resources) {
    if (r._type === TYPE_REQUEST) {
      importRequest(r);
    }
  }
  console.log('CONTENTS', parsed._type, parsed.__export_format);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
