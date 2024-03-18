export function pluginHookImport(contents: string) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (err) {
    return undefined;
  }

  if (!isJSObject(parsed)) {
    return undefined;
  }

  const isYaakExport = 'yaakSchema' in parsed;
  if (!isYaakExport) {
    return;
  }

  // Migrate v1 to v2 -- changes requests to httpRequests
  if ('requests' in parsed.resources) {
    parsed.resources.httpRequests = parsed.resources.requests;
    delete parsed.resources.requests;
  }

  return { resources: parsed.resources }; // Should already be in the correct format
}

export function isJSObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
