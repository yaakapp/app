function u(r) {
  let e;
  try {
    e = JSON.parse(r);
  } catch {
    return;
  }
  if (!(!t(e) || !("yaakSchema" in e)))
    return "requests" in e.resources && (e.resources.httpRequests = e.resources.requests, delete e.resources.requests), { resources: e.resources };
}
function t(r) {
  return Object.prototype.toString.call(r) === "[object Object]";
}
export {
  t as isJSObject,
  u as pluginHookImport
};
