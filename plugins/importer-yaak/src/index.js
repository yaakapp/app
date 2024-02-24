export function pluginHookImport(contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (err) {
    return undefined;
  }

  if (!isJSObject(parsed)) {
    return undefined;
  }

  if (!('yaakSchema' in parsed)) {
    return;
  }

  // Migrate v1 to v2 -- changes requests to httpRequests
  if (parsed.yaakSchema === 1) {
    parsed.resources.httpRequests = parsed.resources.requests;
    parsed.yaakSchema = 2;
  }

  if (parsed.yaakSchema === 2) {
    return { resources: parsed.resources }; // Should already be in the correct format
  }

  return undefined;
}

export function isJSObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
