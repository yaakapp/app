const m = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
function b(e) {
  const r = p(e);
  if (r == null) return;
  const i = s(r.info);
  if (i.schema !== m || !Array.isArray(r.item)) return;
  const n = {
      workspaces: [],
      environments: [],
      requests: [],
      folders: [],
    },
    c = {
      model: 'workspace',
      id: 'wrk_0',
      name: i.name || 'Postman Import',
      description: i.description || '',
    };
  n.workspaces.push(c);
  const u = (o, l = null) => {
    if (typeof o.name == 'string' && Array.isArray(o.item)) {
      const t = {
        model: 'folder',
        workspaceId: c.id,
        id: `fld_${n.folders.length}`,
        name: o.name,
        folderId: l,
      };
      n.folders.push(t);
      for (const a of o.item) u(a, t.id);
    } else if (typeof o.name == 'string' && 'request' in o) {
      const t = s(o.request),
        a = f(t.body),
        d = {
          model: 'http_request',
          id: `req_${n.requests.length}`,
          workspaceId: c.id,
          folderId: l,
          name: o.name,
          method: t.method || 'GET',
          url: s(t.url).raw,
          headers: [...a.headers, ...h(t.header).map(y)],
          body: a.body,
          bodyType: a.bodyType,
          // TODO: support auth
          // ...importAuth(r.auth),
        };
      n.requests.push(d);
    } else console.log('Unknown item', o, l);
  };
  for (const o of r.item) u(o);
  return { resources: n };
}
function y(e) {
  const r = s(e);
  return { name: r.key, value: r.value, enabled: !0 };
}
function f(e) {
  const r = s(e);
  return 'graphql' in r
    ? {
        headers: [
          {
            name: 'Content-Type',
            value: 'application/json',
            enabled: !0,
          },
        ],
        bodyType: 'graphql',
        body: JSON.stringify(
          { query: r.graphql.query, variables: p(r.graphql.variables) },
          null,
          2,
        ),
      }
    : { bodyType: null, body: null };
}
function p(e) {
  try {
    return s(JSON.parse(e));
  } catch {}
  return null;
}
function s(e) {
  return Object.prototype.toString.call(e) === '[object Object]' ? e : {};
}
function h(e) {
  return Object.prototype.toString.call(e) === '[object Array]' ? e : [];
}
export { b as pluginHookImport };
