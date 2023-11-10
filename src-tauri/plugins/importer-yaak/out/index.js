function u(r) {
  let e;
  try {
    e = JSON.parse(r);
  } catch {
    return;
  }
  if (t(e) && e.yaakSchema === 1) return { resources: e.resources };
}
function t(r) {
  return Object.prototype.toString.call(r) === '[object Object]';
}
export { t as isJSObject, u as pluginHookImport };
