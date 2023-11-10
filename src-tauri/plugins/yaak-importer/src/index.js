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

  if (parsed.yaakSchema !== 1) return undefined;

  return parsed.resources; // Should already be in the correct format
}

export function isJSObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
