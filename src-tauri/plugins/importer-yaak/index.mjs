function u(r, t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return;
  }
  if (!(!s(e) || !("yaakSchema" in e)))
    return "requests" in e.resources && (e.resources.httpRequests = e.resources.requests, delete e.resources.requests), { resources: e.resources };
}
function s(r) {
  return Object.prototype.toString.call(r) === "[object Object]";
}
export {
  s as isJSObject,
  u as pluginHookImport
};
//# sourceMappingURL=index.mjs.map
