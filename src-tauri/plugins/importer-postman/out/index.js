const y = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  f = 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
  b = [f, y];
function T(e) {
  const t = h(e);
  if (t == null) return;
  const i = s(t.info);
  if (!b.includes(i.schema) || !Array.isArray(t.item)) return;
  const r = {
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
  r.workspaces.push(c);
  const d = (o, l = null) => {
    if (typeof o.name == 'string' && Array.isArray(o.item)) {
      const n = {
        model: 'folder',
        workspaceId: c.id,
        id: `fld_${r.folders.length}`,
        name: o.name,
        folderId: l,
      };
      r.folders.push(n);
      for (const a of o.item) d(a, n.id);
    } else if (typeof o.name == 'string' && 'request' in o) {
      const n = s(o.request),
        a = q(n.body),
        u = g(n.auth),
        m = {
          model: 'http_request',
          id: `req_${r.requests.length}`,
          workspaceId: c.id,
          folderId: l,
          name: o.name,
          method: n.method || 'GET',
          url: typeof n.url == 'string' ? n.url : s(n.url).raw,
          body: a.body,
          bodyType: a.bodyType,
          authentication: u.authentication,
          authenticationType: u.authenticationType,
          headers: [
            ...a.headers,
            ...u.headers,
            ...A(n.header).map((p) => ({
              name: p.key,
              value: p.value,
              enabled: !p.disabled,
            })),
          ],
        };
      r.requests.push(m);
    } else console.log('Unknown item', o, l);
  };
  for (const o of t.item) d(o);
  return { resources: r };
}
function g(e) {
  const t = s(e);
  return 'basic' in t
    ? {
        headers: [],
        authenticationType: 'basic',
        authentication: {
          username: t.basic.username || '',
          password: t.basic.password || '',
        },
      }
    : { headers: [], authenticationType: null, authentication: {} };
}
function q(e) {
  const t = s(e);
  return 'graphql' in t
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
          { query: t.graphql.query, variables: h(t.graphql.variables) },
          null,
          2,
        ),
      }
    : { headers: [], bodyType: null, body: null };
}
function h(e) {
  try {
    return s(JSON.parse(e));
  } catch {}
  return null;
}
function s(e) {
  return Object.prototype.toString.call(e) === '[object Object]' ? e : {};
}
function A(e) {
  return Object.prototype.toString.call(e) === '[object Array]' ? e : [];
}
export { T as pluginHookImport };
